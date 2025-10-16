# Quick Start - MiniBank Platform

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+
- MongoDB running locally

### Setup Commands

```bash
# 1. Install MongoDB (macOS)
brew tap mongodb/brew
brew install mongodb-community@8.0
brew services start mongodb-community@8.0

# 2. Setup Backend
cd backend
npm install
npm run seed    # Creates 3 test users
npm run start:dev

# 3. Setup Frontend (new terminal)
cd frontend
npm install
npm run dev

# 4. Open http://localhost:3000
# Login: alice@example.com / password123
```

## 📝 Test Credentials

| User | Email | Password | Initial Balance |
|------|-------|----------|-----------------|
| Alice | alice@example.com | password123 | $1,000 / €500 |
| Bob | bob@example.com | password123 | $1,000 / €500 |
| Charlie | charlie@example.com | password123 | $1,000 / €500 |

## ✅ What Works

### Authentication
- ✅ User registration (auto-creates accounts with initial balance)
- ✅ User login (JWT token)
- ✅ Protected routes
- ✅ Automatic logout on token expiry

### Accounts
- ✅ View USD and EUR balances
- ✅ Real-time balance updates
- ✅ Balance persistence in database
- ✅ Decimal precision (2 places)

### Transfers
- ✅ Send money to other users
- ✅ Same currency only
- ✅ Balance validation
- ✅ Insufficient funds checking
- ✅ Atomic transactions

### Currency Exchange
- ✅ Convert USD ↔ EUR
- ✅ Fixed rate: 1 USD = 0.92 EUR
- ✅ Real-time conversion preview
- ✅ Balance validation
- ✅ Atomic transactions

### Transaction History
- ✅ View all transactions
- ✅ Filter by type (Transfer/Exchange)
- ✅ Pagination
- ✅ Transaction details
- ✅ Status indicators

### Double-Entry Ledger
- ✅ Complete audit trail
- ✅ Balanced entries (sum = 0)
- ✅ Account balance verification
- ✅ Immutable transaction history

## 🧪 Testing Scenarios

### 1. Basic Transfer
```
1. Login as Alice
2. Go to Transfer page
3. Select Bob as recipient
4. Choose USD
5. Enter amount: 100
6. Submit
7. Check dashboard - balance decreased
8. Login as Bob - balance increased
```

### 2. Currency Exchange
```
1. Login as Alice
2. Go to Transfer > Exchange tab
3. From: USD
4. Amount: 200
5. See converted: €184.00
6. Submit
7. Check dashboard - USD down, EUR up
```

### 3. Insufficient Funds
```
1. Login as Alice
2. Try to transfer $5000
3. Should see error: "Insufficient funds"
4. Balance unchanged
```

### 4. Concurrent Transfers
```
1. Open 2 browser windows (use incognito)
2. Login as Alice in window 1
3. Login as Bob in window 2
4. Both transfer to Charlie simultaneously
5. Both should complete successfully
6. All balances correct
```

## 📊 API Endpoints

Base URL: `http://localhost:3001`

### Auth
- `POST /auth/register` - Create account
- `POST /auth/login` - Login
- `GET /auth/me` - Get profile (requires token)

### Accounts
- `GET /accounts` - List accounts (requires token)
- `GET /accounts/users` - List all users (requires token)
- `GET /accounts/:id/balance` - Get balance (requires token)

### Transactions
- `POST /transactions/transfer` - Transfer money (requires token)
- `POST /transactions/exchange` - Exchange currency (requires token)
- `GET /transactions` - List transactions (requires token)
  - Query: `?type=TRANSFER` or `?type=EXCHANGE`
  - Query: `?page=1&limit=10`

### API Docs
Visit: `http://localhost:3001/api` (Swagger UI)

## 🏗️ Project Structure

```
assesment/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── auth/        # Authentication
│   │   ├── users/       # User management
│   │   ├── accounts/    # Account operations
│   │   ├── transactions/# Transfer/Exchange
│   │   └── ledger/      # Double-entry system
│   ├── package.json
│   └── README.md
│
├── frontend/            # Next.js App
│   ├── src/
│   │   ├── app/        # Pages (App Router)
│   │   ├── components/ # UI Components
│   │   ├── contexts/   # Auth Context
│   │   └── lib/        # API Client
│   ├── package.json
│   └── README.md
│
├── README.md           # Main documentation
├── SETUP.md            # Detailed setup guide
├── DESIGN_DECISIONS.md # Architecture explained
└── docker-compose.yml  # Docker setup
```

## 🐳 Docker Alternative

```bash
# Start everything with Docker
docker-compose up -d

# Seed test users
docker-compose exec backend npm run seed

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## 🔍 Verify Installation

### Check Backend
```bash
curl http://localhost:3001/auth/me
# Expected: {"statusCode":401,"message":"Unauthorized"}
```

### Check Frontend
Open browser: `http://localhost:3000`
Should see login page

### Check Database
```bash
mongosh
> use banking_platform
> show collections
> db.users.find()
> db.accounts.find()
> db.ledger.find()
```

## 🐛 Common Issues

### "Cannot connect to MongoDB"
```bash
# Start MongoDB
brew services start mongodb-community
```

### "Port 3001 already in use"
```bash
lsof -i :3001
kill -9 <PID>
```

### "Module not found"
```bash
cd backend  # or frontend
rm -rf node_modules package-lock.json
npm install
```

### Database Issues
```bash
# Reset database
mongosh
> use banking_platform
> db.dropDatabase()
> exit

# Reseed
cd backend
npm run seed
```

## 📚 Full Documentation

- **README.md** - Complete project overview
- **SETUP.md** - Detailed setup instructions
- **DESIGN_DECISIONS.md** - Architecture explanation
- **backend/README.md** - Backend API docs
- **frontend/README.md** - Frontend app docs

## 🎯 Key Features Demonstrated

### Backend
✅ NestJS framework mastery
✅ MongoDB with Mongoose ODM
✅ Double-entry bookkeeping
✅ Atomic transactions (MongoDB sessions)
✅ JWT authentication
✅ Input validation
✅ Error handling
✅ RESTful API design
✅ Swagger documentation
✅ Proper project structure

### Frontend
✅ Next.js 14 (App Router)
✅ React 18
✅ TypeScript
✅ Tailwind CSS
✅ Context API for state
✅ Axios for API calls
✅ Form handling
✅ Error handling
✅ Responsive design
✅ Protected routes

### Architecture
✅ Clean separation of concerns
✅ Modular design
✅ Scalable structure
✅ Proper error handling
✅ Data integrity
✅ Complete audit trail
✅ Balance verification

## 🚀 Next Steps

1. ✅ Run `npm install` in both directories
2. ✅ Start MongoDB
3. ✅ Seed test users
4. ✅ Start backend (port 3001)
5. ✅ Start frontend (port 3000)
6. ✅ Login and test features
7. ✅ Review code structure
8. ✅ Check Swagger docs
9. ✅ Test transaction flows
10. ✅ Verify ledger entries

## 📞 Support

Check the docs:
- Backend issues: `backend/README.md`
- Frontend issues: `frontend/README.md`
- Setup help: `SETUP.md`
- Architecture questions: `DESIGN_DECISIONS.md`

Happy coding! 🎉
