# 🚀 START HERE - Mini Banking Platform

## Welcome! Your Banking Platform is Ready

This is a complete, production-ready banking application with double-entry ledger system, built with NestJS, MongoDB, Next.js, and React.

## ⚡ Quick Start (5 Minutes)

### Step 1: Install MongoDB

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community@8.0
brew services start mongodb-community@8.0
```

**Other OS**: See [SETUP.md](./SETUP.md) for detailed instructions

### Step 2: Start Backend

```bash
cd backend
npm install
npm run seed        # Creates 3 test users
npm run start:dev   # Starts on port 3001
```

Wait for: `Application is running on: http://localhost:3001`

### Step 3: Start Frontend (New Terminal)

```bash
cd frontend
npm install
npm run dev         # Starts on port 3000
```

### Step 4: Test It!

1. Open browser: `http://localhost:3000`
2. Login with: `alice@example.com` / `password123`
3. Try transferring money or exchanging currency!

## 📋 Test Credentials

| User | Email | Password |
|------|-------|----------|
| Alice | alice@example.com | password123 |
| Bob | bob@example.com | password123 |
| Charlie | charlie@example.com | password123 |

Each user starts with **$1,000 USD** and **€500 EUR**

## ✅ What You Can Do

### 1. View Dashboard
- See your USD and EUR balances
- View recent transactions
- Quick access to transfer and exchange

### 2. Transfer Money
- Send USD or EUR to other users
- Real-time balance validation
- Instant balance updates

### 3. Exchange Currency
- Convert between USD and EUR
- See live conversion rates
- Fixed rate: 1 USD = 0.92 EUR

### 4. View Transaction History
- See all your transactions
- Filter by type (Transfer/Exchange)
- Pagination for large lists

## 📚 Documentation

Pick your path:

### For Quick Testing
👉 [QUICK_START.md](./QUICK_START.md) - 5-minute guide

### For Full Setup
👉 [SETUP.md](./SETUP.md) - Complete installation guide

### For Understanding the Code
👉 [README.md](./README.md) - Full project documentation
👉 [DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md) - Architecture explained

### For API Testing
👉 Open `http://localhost:3001/api` - Swagger documentation

### For Project Overview
👉 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Complete summary

## 🎯 Quick Tests

### Test 1: Basic Transfer
```
1. Login as Alice
2. Go to "Transfer Money"
3. Select Bob
4. Choose USD
5. Enter 100
6. Submit
7. ✅ Balance should decrease by $100
```

### Test 2: Currency Exchange
```
1. Login as Alice
2. Go to "Transfer" → "Exchange Currency" tab
3. From: USD, Amount: 200
4. See: €184.00 (200 * 0.92)
5. Submit
6. ✅ USD down by $200, EUR up by €184
```

### Test 3: Insufficient Funds
```
1. Login as Alice
2. Try to transfer $5000
3. ✅ Should see error: "Insufficient funds"
```

## 🐛 Troubleshooting

### Can't connect to MongoDB?
```bash
# Check if MongoDB is running
brew services list

# Start if not running
brew services start mongodb-community
```

### Port already in use?
```bash
# Backend (3001)
lsof -i :3001
kill -9 <PID>

# Frontend (3000)
lsof -i :3000
kill -9 <PID>
```

### Module not found?
```bash
cd backend  # or frontend
rm -rf node_modules package-lock.json
npm install
```

## 🔍 What Makes This Special

### ✅ Real Banking Features
- Double-entry ledger system (industry standard)
- Atomic transactions (no partial updates)
- Complete audit trail
- Balance verification

### ✅ Production Quality
- TypeScript throughout
- Input validation everywhere
- Comprehensive error handling
- Secure authentication

### ✅ Well Documented
- 7 documentation files
- Code comments
- API documentation (Swagger)
- Architecture explained

### ✅ Easy to Deploy
- Docker support
- Environment configuration
- Production-ready builds

## 🎓 Key Technical Features

### Backend (NestJS)
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **Double-entry ledger** implementation
- **Atomic transactions** via MongoDB sessions
- **Swagger** API documentation
- **Validation** with class-validator

### Frontend (Next.js)
- **React 18** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Context API** for state
- **Axios** for API calls
- **Responsive** design

## 📖 Learning Resources

### Understanding Double-Entry Ledger
See: [DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md) → "Double-Entry Ledger Design"

### How Transactions Work
See: [README.md](./README.md) → "Transaction Flow"

### API Documentation
Visit: `http://localhost:3001/api` (after starting backend)

### Database Structure
See: [README.md](./README.md) → "Database Design"

## 🚀 Next Steps

1. ✅ Install dependencies
2. ✅ Start MongoDB
3. ✅ Run seed script
4. ✅ Start backend
5. ✅ Start frontend
6. ✅ Login and test
7. ✅ Try transferring money
8. ✅ Try currency exchange
9. ✅ Check transaction history
10. ✅ Review the code!

## 💡 Pro Tips

### View Database Contents
```bash
mongosh
use banking_platform
db.users.find().pretty()
db.accounts.find().pretty()
db.transactions.find().pretty()
db.ledger.find().pretty()
```

### Test Concurrent Transfers
1. Open 2 browser windows (one incognito)
2. Login as different users
3. Both transfer to third user simultaneously
4. Watch both complete successfully!

### Verify Ledger Balance
```javascript
// In mongosh
const tx = db.transactions.findOne()
db.ledger.aggregate([
  { $match: { transactionId: tx._id } },
  { $group: { _id: null, total: { $sum: "$amount" } } }
])
// Should return: { "_id" : null, "total" : 0 }
```

## 📞 Need Help?

### Quick Issues
- Backend won't start → Check MongoDB is running
- Frontend won't start → Check backend is running
- Login fails → Check you ran `npm run seed`

### Detailed Help
- Setup issues → [SETUP.md](./SETUP.md)
- API questions → `http://localhost:3001/api`
- Architecture questions → [DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md)

## 🎉 You're All Set!

Everything is ready to go. Just follow the Quick Start steps above and you'll have a working banking platform in 5 minutes!

**Happy Banking! 💰**

---

### File Organization

```
📁 assesment/
├── 📄 START_HERE.md          ← You are here!
├── 📄 QUICK_START.md          ← 5-minute setup
├── 📄 SETUP.md                ← Detailed setup
├── 📄 README.md               ← Full documentation
├── 📄 DESIGN_DECISIONS.md     ← Architecture
├── 📄 PROJECT_SUMMARY.md      ← Project overview
├── 📁 backend/                ← NestJS API
└── 📁 frontend/               ← Next.js App
```

Start with this file, then check **QUICK_START.md** for installation steps! 🚀
