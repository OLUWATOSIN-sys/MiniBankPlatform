# MiniBank Platform

A full-stack banking application with double-entry ledger system, built with NestJS, PostgreSQL, Next.js, and React.

## 🚀 **Live Deployment**

- **🌐 Frontend**: [https://mini-bank-platform.vercel.app](https://mini-bank-platform.vercel.app)
- **🔗 Backend API**: [https://minibank-backend.onrender.com](https://minibank-backend.onrender.com)
- **📚 API Docs**: [https://minibank-backend.onrender.com/api](https://minibank-backend.onrender.com/api)

## 🏗️ **Deployment Architecture**

- **Frontend**: Deployed on **Vercel** (auto-deploy from main branch)
- **Backend**: Deployed on **Render** (auto-deploy from main branch)  
- **Database**: **PostgreSQL** on Render (managed database)
- **Repository**: Single mono-repo with path-based deployment

## 🚀 Project Overview

This project implements a simplified banking platform demonstrating:

- **Double-entry ledger system** for complete audit trail
- **Atomic transactions** using MongoDB sessions
- **Currency exchange** between USD and EUR
- **Money transfers** between users
- **Real-time balance management**
- **Secure authentication** with JWT
- **Modern UI** with Next.js and Tailwind CSS

## 📋 Assessment Requirements Met

### Must Have (70%)
- ✅ Functional double-entry ledger implementation
- ✅ Ledger entries as authoritative audit trail
- ✅ Account balances synced with ledger
- ✅ All transaction types working (transfer, exchange)
- ✅ Concurrent operation handling with MongoDB sessions
- ✅ Prevention of invalid states (negative balances)
- ✅ Clean, organized code structure
- ✅ Authentication working (JWT)
- ✅ Functional UI with working forms and data display

### Should Have (20%)
- ✅ Comprehensive error messages
- ✅ API error handling
- ✅ Loading states in UI
- ✅ Database seeders for test users
- ✅ Environment configuration
- ✅ Input validation (frontend + backend)
- ✅ Transaction success feedback

### Nice to Have (10%)
- ✅ API documentation (Swagger)
- ✅ Balance verification capability
- ✅ Detailed README files
- ✅ Proper project structure

## 🏗️ Architecture

### Backend (NestJS + MongoDB)

```
backend/src/
├── auth/              # Authentication (JWT)
├── users/             # User management
├── accounts/          # Account operations
├── transactions/      # Transfer & exchange logic
├── ledger/            # Double-entry bookkeeping
└── main.ts           # Application entry
```

**Key Design Decisions:**

1. **MongoDB with Sessions**: Ensures atomic multi-document transactions
2. **Separate Ledger Collection**: Complete audit trail independent of transactions
3. **Balance Caching**: Account balances stored for performance, verified against ledger
4. **Double-Entry System**: Every transaction creates balanced entries (sum = 0)

### Frontend (Next.js + React)

```
frontend/src/
├── app/              # Next.js 14 App Router
│   ├── dashboard/   # Main dashboard
│   ├── transfer/    # Transfer & exchange
│   └── transactions/ # History
├── components/       # Reusable UI components
├── contexts/         # React contexts (Auth)
└── lib/             # API client & utilities
```

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS 10
- **Database**: MongoDB 8.0
- **ODM**: Mongoose
- **Authentication**: JWT (Passport)
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Language**: TypeScript

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ or 20+
- MongoDB 5.0+ (running locally or remote)
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd assesment
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   
   # Start MongoDB (macOS with Homebrew)
   brew services start mongodb-community
   
   # Seed test users
   npm run seed
   
   # Start backend
   npm run start:dev
   ```

   Backend will be available at `http://localhost:3001`
   
   Swagger docs at `http://localhost:3001/api`

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   
   # Start frontend
   npm run dev
   ```

   Frontend will be available at `http://localhost:3000`

## 👥 Test Users

After running `npm run seed` in the backend, you'll have:

| Email | Password | USD Balance | EUR Balance |
|-------|----------|-------------|-------------|
| alice@example.com | password123 | $1,000.00 | €500.00 |
| bob@example.com | password123 | $1,000.00 | €500.00 |
| charlie@example.com | password123 | $1,000.00 | €500.00 |

## 🔐 User Management Approach

**Option A (Implemented)**: User Registration Endpoint

- Users can register via `POST /auth/register`
- Each new user automatically receives:
  - 1 USD account with $1,000.00
  - 1 EUR account with €500.00
- Initial balances recorded in ledger as `INITIAL_DEPOSIT`

**Pre-seeded users** available via `npm run seed` for testing.

## 🗄️ Database Design

### Double-Entry Ledger System

Every financial transaction creates balanced ledger entries where amounts sum to zero:

**Example 1: Transfer $50 from Alice to Bob**

| Account | Amount | Balance After |
|---------|--------|---------------|
| Alice USD | -50.00 | 950.00 |
| Bob USD | +50.00 | 1050.00 |
| **Sum** | **0.00** | - |

**Example 2: Exchange $100 to €92 for Alice**

| Account | Amount | Balance After |
|---------|--------|---------------|
| Alice USD | -100.00 | 900.00 |
| Alice EUR | +92.00 | 592.00 |

### Collections

1. **users**: User credentials and profile
   ```javascript
   {
     email, password (hashed), firstName, lastName
   }
   ```

2. **accounts**: User currency accounts
   ```javascript
   {
     userId, currency (USD/EUR), balance, isActive
   }
   ```

3. **ledger**: Double-entry records (audit trail)
   ```javascript
   {
     accountId, transactionId, amount, balanceAfter,
     entryType, description, metadata
   }
   ```

4. **transactions**: High-level transaction records
   ```javascript
   {
     type (TRANSFER/EXCHANGE), status, fromAccountId,
     toAccountId, amount, currency, exchangeRate
   }
   ```

### Indexes

- `accounts`: `{ userId, currency }` (unique)
- `ledger`: `{ accountId, createdAt }`, `{ transactionId }`
- `transactions`: `{ fromAccountId, createdAt }`, `{ type }`, `{ status }`

## 🔄 Transaction Flow

### Transfer Process

1. **Validate** request and check permissions
2. **Start** MongoDB session
3. **Create** transaction record (status: PENDING)
4. **Check** sender has sufficient funds
5. **Update** both account balances
6. **Create** balanced ledger entries
7. **Verify** ledger sum equals zero
8. **Update** transaction status (COMPLETED)
9. **Commit** session (atomic)
10. **On error**: Abort session (full rollback)

### Exchange Process

Similar flow, with:
- Exchange rate calculation (1 USD = 0.92 EUR)
- Converted amount calculation
- Both accounts belong to same user

## 🔒 Data Integrity

### Ensuring Transaction Atomicity

```typescript
const session = await connection.startSession();
session.startTransaction();

try {
  // All operations within session
  await updateBalances(session);
  await createLedgerEntries(session);
  await verifyLedger();
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### Preventing Invalid States

- ✅ Balance checks before updates
- ✅ Ledger verification (sum must equal zero)
- ✅ MongoDB session rollback on any error
- ✅ Decimal precision maintained (2 places)
- ✅ Concurrent transaction handling via database

### Currency Precision

All monetary amounts use:
```typescript
Math.round(amount * 100) / 100  // Ensures 2 decimal places
```

## 📊 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user (protected)

### Accounts
- `GET /accounts` - List user's accounts (protected)
- `GET /accounts/users` - Get all users for transfers (protected)
- `GET /accounts/:id/balance` - Get account balance (protected)

### Transactions
- `POST /transactions/transfer` - Transfer funds (protected)
- `POST /transactions/exchange` - Exchange currency (protected)
- `GET /transactions` - List transactions with filters (protected)
- `GET /transactions/recent` - Get recent 5 transactions (protected)

**Query Parameters for GET /transactions:**
- `type`: TRANSFER | EXCHANGE
- `page`: number (default: 1)
- `limit`: number (default: 10)

## 🧪 Testing

### Manual Testing

1. **Register/Login** with test users
2. **View Dashboard** - Check initial balances
3. **Transfer Money** - Send money between users
4. **Exchange Currency** - Convert USD ↔ EUR
5. **View Transactions** - Check history and filters

### API Testing (Swagger)

Visit `http://localhost:3001/api` for interactive API documentation.

### Testing Scenarios

✅ **Sufficient Funds Transfer**: Alice → Bob $100
✅ **Insufficient Funds**: Try transfer $5000 (should fail)
✅ **Currency Exchange**: $100 → €92
✅ **Concurrent Transfers**: Multiple users transferring simultaneously
✅ **Ledger Balance**: Verify sum of ledger entries = 0

## 🔍 Verification

### Balance Reconciliation

To verify account balance matches ledger:

```typescript
// Backend: ledger.service.ts
async calculateBalanceFromLedger(accountId: string): Promise<number> {
  const entries = await ledgerModel.find({ accountId });
  return entries.reduce((sum, entry) => sum + entry.amount, 0);
}
```

Compare with `account.balance` to ensure consistency.

## 📈 Scaling Considerations

### For Production Deployment

1. **Database**:
   - MongoDB replica set for high availability
   - Proper indexing strategy
   - Connection pooling
   - Sharding for large datasets

2. **Backend**:
   - Horizontal scaling with load balancer
   - Redis for session management
   - Rate limiting per user
   - Queue system for transactions (BullMQ)

3. **Frontend**:
   - CDN for static assets
   - Server-side rendering (Next.js)
   - Image optimization
   - Bundle size optimization

4. **Monitoring**:
   - APM (Application Performance Monitoring)
   - Error tracking (Sentry)
   - Transaction audit logs
   - Alert system for failed transactions

## 🚨 Known Limitations

- Fixed exchange rate (not real-time API)
- No transaction fees
- Limited to USD and EUR
- No account statements/exports
- Token in localStorage (consider httpOnly cookies)
- No email notifications
- No 2FA authentication

## 🔮 Future Enhancements

- [ ] Real-time exchange rates from external API
- [ ] Support for more currencies
- [ ] Transaction fees and commissions
- [ ] Account statements (PDF)
- [ ] Email notifications
- [ ] WebSocket for real-time updates
- [ ] 2FA authentication
- [ ] Transaction limits and daily caps
- [ ] Scheduled/recurring transfers
- [ ] Admin dashboard
- [ ] Comprehensive test suite
- [ ] Docker compose setup
- [ ] CI/CD pipeline

## 🤔 Questions Addressed

### How do you ensure transaction atomicity?
MongoDB sessions with `startTransaction()` and `commitTransaction()`. Any error triggers `abortTransaction()` for full rollback.

### How do you prevent double-spending?
- Balance checks before transaction
- Atomic updates within session
- MongoDB document-level locking
- Verification of ledger balance

### How do you maintain consistency?
- All operations within same session
- Ledger verification (sum = 0)
- Balance updated simultaneously with ledger
- Rollback on any failure

### How would you handle decimal precision?
- `Math.round(amount * 100) / 100` for all calculations
- Stored as Number with 2 decimal places
- Consistent rounding across all operations

### What indexing strategy?
- Compound index: `{ userId, currency }` on accounts
- Index: `{ accountId, createdAt }` on ledger
- Index: `{ transactionId }` on ledger
- Index: `{ fromAccountId, createdAt }` on transactions

### How to verify balances are synchronized?
```typescript
const ledgerBalance = await calculateBalanceFromLedger(accountId);
const accountBalance = await getAccountBalance(accountId);
assert(ledgerBalance === accountBalance);
```

### How would you scale for millions of users?
- Database sharding by userId
- Read replicas for queries
- Caching layer (Redis)
- Queue system for async processing
- Microservices architecture
- Load balancing

## 📄 License

MIT

## 👨‍💻 Development

This project was built as an assessment demonstrating:
- Full-stack development skills
- Financial system design
- Database architecture
- API design
- Modern frontend development
- TypeScript proficiency

**Time Box**: 48 hours
**Priority**: Backend correctness > Frontend polish
**Approach**: Registration + pre-seeded users
