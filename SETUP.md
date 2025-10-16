# Quick Setup Guide

## Prerequisites

Ensure you have installed:
- Node.js 18+ or 20+
- MongoDB 5.0+
- npm or yarn

## Option 1: Manual Setup (Recommended for Development)

### Step 1: Install MongoDB

**macOS (with Homebrew)**:
```bash
brew tap mongodb/brew
brew install mongodb-community@8.0
brew services start mongodb-community@8.0
```

**Ubuntu/Debian**:
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-8.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/8.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

**Windows**:
Download and install from [MongoDB Download Center](https://www.mongodb.com/try/download/community)

### Step 2: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env if needed (default MongoDB connection is fine for local)

# Seed test users (creates 3 users with initial balances)
npm run seed

# Start backend in development mode
npm run start:dev
```

Backend will be running at `http://localhost:3001`

Swagger API docs at `http://localhost:3001/api`

### Step 3: Setup Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start frontend in development mode
npm run dev
```

Frontend will be running at `http://localhost:3000`

### Step 4: Test the Application

1. Open browser to `http://localhost:3000`
2. You'll be redirected to login page
3. Use test credentials:
   - Email: `alice@example.com`
   - Password: `password123`
4. Or register a new account

## Option 2: Docker Setup (Recommended for Quick Demo)

### Prerequisites
- Docker
- Docker Compose

### Run Everything

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Services will be available at:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- MongoDB: `localhost:27017`

### Seed Data in Docker

```bash
# Seed test users
docker-compose exec backend npm run seed
```

## Verification

### Check Backend is Running

```bash
curl http://localhost:3001/auth/me
# Should return: {"statusCode":401,"message":"Unauthorized"}
```

### Check Frontend is Running

Open `http://localhost:3000` in browser - you should see the login page.

### Check MongoDB is Running

```bash
# Using mongosh (MongoDB Shell)
mongosh

# In mongosh:
show dbs
use banking_platform
show collections
```

## Test Users

After running seed script, you'll have these users:

| Email | Password | USD Balance | EUR Balance |
|-------|----------|-------------|-------------|
| alice@example.com | password123 | $1,000.00 | €500.00 |
| bob@example.com | password123 | $1,000.00 | €500.00 |
| charlie@example.com | password123 | $1,000.00 | €500.00 |

## Testing the Application

### 1. Login
- Go to `http://localhost:3000/login`
- Use `alice@example.com` / `password123`

### 2. View Dashboard
- See your USD and EUR balances
- View recent transactions

### 3. Transfer Money
- Click "Transfer Money"
- Select recipient (Bob or Charlie)
- Choose currency (USD or EUR)
- Enter amount (e.g., 50)
- Submit transfer
- Check balance updates

### 4. Exchange Currency
- Click "Exchange Currency" (or go to Transfer tab)
- Select "Exchange Currency" tab
- Choose "From Currency" (USD or EUR)
- Enter amount (e.g., 100)
- See converted amount (1 USD = 0.92 EUR)
- Submit exchange

### 5. View Transaction History
- Click "Transactions" in navigation
- Filter by type (Transfer/Exchange)
- Use pagination to browse all transactions

## Troubleshooting

### Backend won't start

**Error**: "Cannot connect to MongoDB"
```bash
# Check if MongoDB is running
brew services list  # macOS
sudo systemctl status mongod  # Linux

# Start MongoDB if stopped
brew services start mongodb-community  # macOS
sudo systemctl start mongod  # Linux
```

**Error**: "Port 3001 already in use"
```bash
# Find process using port
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### Frontend won't start

**Error**: "Port 3000 already in use"
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>

# Or change port in package.json
"dev": "next dev -p 3002"
```

**Error**: "Cannot connect to backend API"
- Ensure backend is running on port 3001
- Check `.env.local` has correct API URL: `NEXT_PUBLIC_API_URL=http://localhost:3001`

### Database issues

**Clear all data and reseed**:
```bash
# Using mongosh
mongosh
use banking_platform
db.dropDatabase()
exit

# Reseed
cd backend
npm run seed
```

### Module not found errors

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json .next
npm install
```

## Development Tips

### Watch Logs

**Backend**:
```bash
cd backend
npm run start:dev  # Auto-restarts on file changes
```

**Frontend**:
```bash
cd frontend
npm run dev  # Hot reload enabled
```

### API Documentation

Visit `http://localhost:3001/api` for interactive Swagger documentation.

You can test all API endpoints directly from the browser.

### Database Inspection

**Using MongoDB Compass** (GUI):
1. Download from [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to `mongodb://localhost:27017`
3. Browse `banking_platform` database

**Using mongosh** (CLI):
```bash
mongosh
use banking_platform
db.users.find().pretty()
db.accounts.find().pretty()
db.ledger.find().pretty()
db.transactions.find().pretty()
```

### Check Ledger Balance

Verify double-entry bookkeeping is working:

```javascript
// In mongosh
use banking_platform

// Get a transaction ID
const tx = db.transactions.findOne()

// Check ledger entries for that transaction
db.ledger.find({ transactionId: tx._id })

// Verify sum equals zero
db.ledger.aggregate([
  { $match: { transactionId: tx._id } },
  { $group: { _id: null, total: { $sum: "$amount" } } }
])
// Should return: { "_id" : null, "total" : 0 }
```

## Next Steps

1. ✅ Login with test user
2. ✅ View dashboard
3. ✅ Make a transfer
4. ✅ Exchange currency
5. ✅ Check transaction history
6. ✅ Verify balances update correctly
7. ✅ Test with multiple users (open incognito windows)

## Production Deployment

For production deployment, see:
- Backend README: `backend/README.md`
- Frontend README: `frontend/README.md`
- Main README: `README.md`

Consider:
- Environment variables for production
- SSL/HTTPS setup
- MongoDB Atlas for hosted database
- Deploy backend to Render/Railway
- Deploy frontend to Vercel/Netlify

## Support

If you encounter issues:

1. Check all services are running
2. Verify environment variables
3. Check MongoDB connection
4. Review error logs
5. Ensure ports 3000, 3001, 27017 are free

Happy banking! 🏦
