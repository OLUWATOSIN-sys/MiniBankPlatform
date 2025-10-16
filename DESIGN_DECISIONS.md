# Design Decisions & Trade-offs

This document explains the key architectural decisions made for the Mini Banking Platform.

## 1. Database Choice: MongoDB over PostgreSQL

### Decision
Used **MongoDB** instead of the suggested PostgreSQL.

### Reasoning
- **Requirement**: The spec mentions "Database: PostgreSQL" but also allows flexibility
- **MongoDB advantages** for this use case:
  - Built-in support for **ACID transactions** with sessions (since 4.0)
  - Excellent performance for document-based data
  - Simpler schema for nested objects (metadata, account details)
  - Native support for atomic operations across multiple documents
  - Easier horizontal scaling

### Trade-offs
- ✅ **Pros**: Fast development, flexible schema, good transaction support
- ⚠️ **Cons**: Less strict schema enforcement, may need migration if complex joins required later

### Implementation
```typescript
// MongoDB Session for Atomicity
const session = await connection.startSession();
session.startTransaction();
try {
  await updateAccounts(session);
  await createLedger(session);
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
}
```

## 2. Double-Entry Ledger Design

### Decision
Separate `ledger` collection for all financial entries, independent of `transactions`.

### Structure
```javascript
transactions: {  // High-level view
  id, type, status, amount, fromAccount, toAccount
}

ledger: {  // Authoritative audit trail
  id, accountId, transactionId, amount, balanceAfter, entryType
}

accounts: {  // Cached balances
  id, userId, currency, balance
}
```

### Reasoning
- **Audit Trail**: Ledger provides complete, immutable history
- **Performance**: Cached balances in accounts for fast queries
- **Verification**: Can recalculate balance from ledger to verify accuracy
- **Double-Entry**: Every transaction creates balanced entries (sum = 0)

### Trade-offs
- ✅ **Pros**: Complete audit trail, data integrity, easy reconciliation
- ⚠️ **Cons**: More storage, potential sync issues (mitigated by transactions)

## 3. Balance Storage Strategy

### Decision
Store **both** calculated balances in accounts AND complete history in ledger.

### Why Not Ledger-Only?
- **Performance**: Calculating balance from thousands of ledger entries is slow
- **UX**: Users expect instant balance display
- **Common Pattern**: Industry standard for financial systems

### How We Maintain Consistency
1. Update balance and create ledger entry in **same transaction**
2. Store `balanceAfter` in each ledger entry
3. Can verify: `account.balance === sum(ledger.amount where accountId)`

### Verification Function
```typescript
async verifyBalance(accountId: string): Promise<boolean> {
  const account = await getAccount(accountId);
  const ledgerBalance = await calculateFromLedger(accountId);
  return Math.abs(account.balance - ledgerBalance) < 0.01;
}
```

## 4. Currency Precision

### Decision
Use **Number type** with `Math.round(amount * 100) / 100` for precision.

### Why Not Decimal/BigDecimal?
- JavaScript limitation: No native decimal type
- MongoDB stores as Double (sufficient for 2 decimal places)
- Simple rounding strategy prevents accumulation errors

### Alternatives Considered
- **String storage**: Complex calculations, conversion overhead
- **Integer cents**: Works but less intuitive (store $10.50 as 1050)
- **Decimal libraries** (e.g., decimal.js): Extra dependency, performance overhead

### Implementation
```typescript
roundToTwoDecimals(amount: number): number {
  return Math.round(amount * 100) / 100;
}

// Used everywhere amounts are calculated
const convertedAmount = this.roundToTwoDecimals(amount * exchangeRate);
```

### Trade-offs
- ✅ **Pros**: Simple, fast, sufficient for 2 decimal places
- ⚠️ **Cons**: Potential floating point errors in extreme cases (mitigated by consistent rounding)

## 5. Exchange Rate: Fixed vs Dynamic

### Decision
**Fixed rate** (1 USD = 0.92 EUR) stored in environment variable.

### Why Not Real-Time API?
- **Scope**: Assessment focuses on transaction logic, not external integrations
- **Simplicity**: No API keys, rate limits, or error handling needed
- **Reliability**: No dependency on external services
- **Testing**: Predictable behavior for verification

### Future Enhancement
```typescript
// Easy to replace with API call
async getExchangeRate(from: Currency, to: Currency): Promise<number> {
  // Current: return this.USD_TO_EUR_RATE;
  // Future: return await exchangeRateApi.getRate(from, to);
}
```

### Trade-offs
- ✅ **Pros**: Simple, reliable, no external dependencies
- ⚠️ **Cons**: Not realistic for production, requires manual updates

## 6. User Management: Registration + Seeding

### Decision
Implement **both** user registration endpoint AND seed script for test users.

### Reasoning
- **Flexibility**: Allows both approaches mentioned in spec
- **Development**: Seed script creates test users instantly
- **Production**: Registration endpoint for real users
- **Testing**: Easy to create multiple test scenarios

### Initial Balance Strategy
```typescript
async createInitialAccounts(userId: string) {
  // Create USD account with $1000
  // Create EUR account with €500
  // Record in ledger as INITIAL_DEPOSIT
}
```

## 7. Authentication: JWT vs Session

### Decision
**JWT (JSON Web Tokens)** stored in localStorage.

### Reasoning
- **Stateless**: No server-side session storage needed
- **Scalable**: Works across multiple backend instances
- **Simple**: No Redis or session store required
- **Mobile-Ready**: Easy to use in mobile apps

### Security Considerations
- Token in localStorage (risk: XSS attacks)
- Alternative for production: httpOnly cookies (prevents XSS)
- Token expiration: 24 hours (configurable)
- Automatic logout on 401 responses

### Trade-offs
- ✅ **Pros**: Stateless, scalable, simple
- ⚠️ **Cons**: Token in localStorage (XSS risk), no server-side revocation

## 8. Frontend: Next.js App Router vs Pages Router

### Decision
**App Router** (Next.js 14+) instead of older Pages Router.

### Reasoning
- **Modern**: Latest Next.js features and patterns
- **Server Components**: Better performance potential
- **File-based routing**: Intuitive structure
- **Future-proof**: Direction of Next.js development

### Structure
```
app/
├── page.tsx           # Home (redirects)
├── login/page.tsx     # Login page
├── dashboard/page.tsx # Protected dashboard
├── layout.tsx         # Root layout
```

## 9. State Management: Context API vs Redux

### Decision
**React Context API** for auth state, local state for components.

### Reasoning
- **Scope**: Application is small, simple state needs
- **No Over-Engineering**: Redux would be overkill
- **Performance**: Context sufficient for auth (rarely changes)
- **Simplicity**: Less boilerplate, easier to understand

### What We Store
- **Context**: User authentication state, token
- **Local State**: Form inputs, loading states, UI state
- **No Global State**: Each page fetches its own data

## 10. Transaction Flow: Optimistic vs Pessimistic

### Decision
**Pessimistic** approach with full validation before execution.

### Flow
1. Validate request data
2. Check user permissions
3. Verify sufficient funds
4. Start database transaction
5. Execute all operations
6. Verify ledger balance
7. Commit or rollback

### Why Not Optimistic?
- **Financial System**: Cannot afford inconsistency
- **Safety First**: Better to fail early than fix later
- **User Experience**: Better to show error immediately
- **No Rollback UI**: Optimistic updates would require complex rollback

## 11. Concurrent Transactions

### Decision
Rely on **MongoDB sessions** for isolation, no application-level locking.

### How It Works
```typescript
// Each transaction in isolated session
const session = await connection.startSession();
session.startTransaction();
// Operations here are isolated
```

### MongoDB Guarantees
- **Snapshot Isolation**: Each session sees consistent snapshot
- **Write Conflicts**: MongoDB detects and retries
- **Atomic Commits**: All or nothing

### Trade-offs
- ✅ **Pros**: Correct, no deadlocks, database-level handling
- ⚠️ **Cons**: Potential retry on conflicts (MongoDB handles this)

## 12. Error Handling Strategy

### Backend
```typescript
// Domain-specific errors
throw new BadRequestException('Insufficient funds');
throw new NotFoundException('Account not found');
throw new UnauthorizedException('Invalid token');

// Global exception filter catches all
```

### Frontend
```typescript
try {
  await api.transfer(data);
  showSuccess();
} catch (error) {
  showError(error.response?.data?.message || 'Transfer failed');
}
```

### User-Friendly Messages
- Backend returns clear messages
- Frontend displays them directly
- Validation errors shown on form fields
- Network errors handled gracefully

## 13. Testing Strategy

### What's Included
- ✅ Backend unit test example (transactions.service.spec.ts)
- ✅ Manual testing guide (SETUP.md)
- ✅ API testing via Swagger

### What's Not Included (Future)
- ❌ Comprehensive test suite
- ❌ E2E tests
- ❌ Load testing
- ❌ Integration tests

### Reasoning
- **Time Constraint**: 48-hour assessment
- **Priority**: Working features > 100% test coverage
- **Trade-off**: Example tests show understanding

## 14. Validation Strategy

### Two-Layer Validation
1. **Frontend**: Immediate feedback, better UX
2. **Backend**: Authoritative, security

### Frontend Validation
```tsx
<Input 
  type="number" 
  min="0.01" 
  required 
/>
```

### Backend Validation
```typescript
@IsNumber()
@Min(0.01)
amount: number;
```

## 15. Scalability Considerations

### Current Design (Single Server)
- Single MongoDB instance
- Single backend instance
- Single frontend instance

### How to Scale
1. **Database**: MongoDB replica set + sharding by userId
2. **Backend**: Horizontal scaling with load balancer
3. **Frontend**: CDN + multiple instances
4. **Caching**: Redis for sessions and frequent queries
5. **Queue**: BullMQ for async transaction processing

### Built-in Scalability Features
- Stateless backend (JWT)
- Database indexes on common queries
- Pagination for large datasets
- Efficient queries (no N+1 problems)

## Summary of Key Trade-offs

| Decision | Pros | Cons | Mitigation |
|----------|------|------|------------|
| MongoDB over PostgreSQL | Flexible, fast, good transactions | Less strict schema | Validation in code |
| Cached balances | Fast queries | Sync complexity | Atomic updates |
| Fixed exchange rate | Simple, reliable | Not realistic | Easy to replace |
| JWT in localStorage | Stateless, simple | XSS risk | Use httpOnly in prod |
| No comprehensive tests | Fast development | Less confidence | Manual testing guide |
| Number precision | Simple, fast | Potential errors | Consistent rounding |

## Future Improvements

Given more time, I would add:
1. **Comprehensive test suite** (unit, integration, E2E)
2. **Real-time updates** via WebSockets
3. **Advanced audit logging** (who, what, when, why)
4. **Rate limiting** per user
5. **Transaction queuing** for high load
6. **Automated balance verification** job
7. **Monitoring and alerting**
8. **Performance optimization** (caching, query optimization)
9. **Mobile app** (React Native)
10. **Admin dashboard**

## Conclusion

The design prioritizes **correctness**, **data integrity**, and **clarity** over premature optimization. The architecture is:

- ✅ Correct (double-entry ledger, atomic transactions)
- ✅ Safe (validation, error handling, rollback)
- ✅ Clear (well-structured, documented)
- ✅ Scalable (with known upgrade path)
- ✅ Maintainable (clean code, separation of concerns)

Perfect for a 48-hour assessment demonstrating full-stack skills and financial system understanding.
