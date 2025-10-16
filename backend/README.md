# Banking Platform Backend

A robust NestJS backend implementing a double-entry ledger system for financial transactions.

## Features

- ✅ **Double-Entry Ledger System**: Full audit trail for all transactions
- ✅ **Account Management**: USD and EUR accounts for each user
- ✅ **Transaction Types**: Transfer and currency exchange
- ✅ **JWT Authentication**: Secure authentication system
- ✅ **Atomic Transactions**: MongoDB sessions ensure data integrity
- ✅ **Concurrent Safety**: Proper handling of concurrent operations
- ✅ **API Documentation**: Swagger/OpenAPI documentation

## Tech Stack

- **Framework**: NestJS
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (Passport)
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js 18+ or 20+
- MongoDB 5.0+ (running locally or remote)
- npm or yarn

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/banking_platform
   JWT_SECRET=your-secret-key-change-in-production
   JWT_EXPIRATION=24h
   PORT=3001
   USD_TO_EUR_RATE=0.92
   ```

3. **Ensure MongoDB is running**:
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community

   # Or run directly
   mongod --config /usr/local/etc/mongod.conf
   ```

## Running the Application

### Development Mode

```bash
npm run start:dev
```

The API will be available at `http://localhost:3001`
Swagger documentation at `http://localhost:3001/api`

### Production Mode

```bash
npm run build
npm run start:prod
```

### Seed Test Users

Create 3 test users with initial balances:

```bash
npm run seed
```

This creates:
- **alice@example.com** / password123 (USD: $1000, EUR: €500)
- **bob@example.com** / password123 (USD: $1000, EUR: €500)
- **charlie@example.com** / password123 (USD: $1000, EUR: €500)

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user profile (protected)

### Accounts

- `GET /accounts` - Get user's accounts (protected)
- `GET /accounts/users` - Get all users for transfers (protected)
- `GET /accounts/:id/balance` - Get specific account balance (protected)

### Transactions

- `POST /transactions/transfer` - Transfer funds to another user (protected)
- `POST /transactions/exchange` - Exchange currency (protected)
- `GET /transactions` - Get transaction history with filters (protected)
- `GET /transactions/recent` - Get recent transactions (protected)

## Database Schema

### Collections

1. **users**: User information
2. **accounts**: User currency accounts with balances
3. **ledger**: Double-entry bookkeeping records (audit trail)
4. **transactions**: High-level transaction records

### Double-Entry Ledger Design

Every transaction creates balanced ledger entries where the sum of amounts equals zero:

**Transfer Example**: $50 from User A to User B
```
Account         | Amount
----------------|----------
User A (USD)    | -50.00
User B (USD)    | +50.00
Sum             |   0.00
```

**Exchange Example**: $100 to €92 for User A
```
Account         | Amount
----------------|----------
User A (USD)    | -100.00
User A (EUR)    | +92.00
Sum (in value)  |   0.00
```

### Data Integrity

- **Atomic Transactions**: MongoDB sessions ensure all-or-nothing operations
- **Balance Consistency**: Account balances always match ledger entries
- **Audit Trail**: Complete history of all financial operations
- **Concurrent Safety**: Proper locking and validation
- **Decimal Precision**: All amounts rounded to 2 decimal places

## Architecture

### Modules

- **Auth Module**: Authentication and authorization
- **Users Module**: User management
- **Accounts Module**: Account management and balance operations
- **Transactions Module**: Transfer and exchange logic
- **Ledger Module**: Double-entry bookkeeping system

### Key Design Decisions

1. **MongoDB Sessions**: Used for atomic multi-document transactions
2. **Double-Entry Ledger**: Separate ledger collection for audit trail
3. **Balance Caching**: Account balances stored for performance, verified against ledger
4. **Currency Precision**: Math.round() for consistent 2-decimal precision
5. **Validation**: Both DTO-level and business logic validation

### Transaction Flow

1. Validate request and check permissions
2. Start MongoDB session
3. Create transaction record (PENDING)
4. Update account balances
5. Create ledger entries
6. Verify ledger balance (sum = 0)
7. Update transaction status (COMPLETED)
8. Commit session
9. On error: Abort session (rollback)

## Testing

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov
```

## Security Considerations

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens for authentication
- ✅ Input validation on all endpoints
- ✅ Protected routes with guards
- ✅ Environment variables for secrets
- ✅ CORS configuration

## Scaling Considerations

For production scale:

1. **Database**: 
   - Add replica set for MongoDB
   - Implement proper indexing strategy
   - Consider sharding for large datasets

2. **Caching**: 
   - Redis for session management
   - Cache frequent queries

3. **Monitoring**:
   - Add logging (Winston, Pino)
   - Implement APM (New Relic, DataDog)
   - Set up alerts for failed transactions

4. **Performance**:
   - Connection pooling
   - Query optimization
   - Rate limiting

## Known Limitations

- Fixed exchange rate (not real-time)
- No support for partial rollbacks
- Limited to USD and EUR currencies
- Basic audit logging

## Future Enhancements

- [ ] Real-time exchange rates API
- [ ] More currency support
- [ ] Transaction fees
- [ ] Account statements
- [ ] Email notifications
- [ ] WebSocket for real-time updates
- [ ] Advanced audit logging
- [ ] Rate limiting
- [ ] 2FA authentication

## License

MIT
