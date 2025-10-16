# Mini Banking Platform

A full-stack banking application where users can manage accounts, transfer money, and exchange currencies between USD and EUR.

## What This App Does

This is a simplified banking system I built with the following features:

- **User Authentication** - Sign up and login with JWT tokens
- **Multiple Currency Accounts** - Each user gets USD and EUR accounts
- **Money Transfers** - Send money to other users
- **Currency Exchange** - Convert between USD and EUR with live rates
- **Transaction History** - View all your past transactions
- **Real-time Balance Updates** - See your account balance update instantly

## Tech Stack

**Backend:**
- NestJS (Node.js framework)
- PostgreSQL (hosted on Render)
- TypeORM
- JWT authentication
- RESTful API

**Frontend:**
- Next.js 14 (React)
- TypeScript
- Tailwind CSS
- Lucide icons

**Deployment:**
- Backend: Render
- Frontend: Vercel
- Database: Render PostgreSQL

## Getting Started

### Prerequisites

You'll need these installed on your machine:
- Node.js (v18 or higher)
- npm or yarn
- Git

### Cloning the Project

```bash
git clone https://github.com/OLUWATOSIN-sys/MiniBankPlatform.git
cd MiniBankPlatform
```

### Running Locally (Recommended)

I recommend running this locally **without Docker** for development. It's simpler and faster to set up.

#### 1. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
NODE_ENV=development
PORT=3001

# Use the deployed Render PostgreSQL database
DATABASE_URL=####################################

DATABASE_HOST=####################################
DATABASE_PORT=5432
DATABASE_USERNAME=####################################
DATABASE_PASSWORD=####################################
DATABASE_NAME=####################################

JWT_SECRET=####################################
JWT_EXPIRATION=24h

USD_TO_EUR_RATE=0.92

FRONTEND_URL=http://localhost:3000

DATABASE_SSL=true
DATABASE_REJECT_UNAUTHORIZED=false
```

**Note:** I'll send you the actual `.env` file with real values separately.

Start the backend:

```bash
npm run start:dev
```

The API will run on http://localhost:3001

#### 2. Set Up the Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

**Note:** I'll send you the actual `.env` file with real values separately.

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start the frontend:

```bash
npm run dev
```

The app will run on http://localhost:3000

### Test Account

You can try the app with this test account:

**Email:** o.olaniran@minibank.com  
**Password:** password123  
**USD Balance:** $25,000  
**EUR Balance:** €25,000

Or feel free to sign up and create your own account to start transacting!

## API Endpoints

The backend exposes these main endpoints:

**Authentication:**
- `POST /auth/register` - Create new account
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user

**Accounts:**
- `GET /accounts` - Get user's accounts
- `GET /accounts/:id/balance` - Get account balance

**Transactions:**
- `POST /transactions/transfer` - Transfer money
- `POST /transactions/exchange` - Exchange currency
- `GET /transactions` - Get transaction history
- `GET /transactions/recent` - Recent transactions

Full API docs available at: http://localhost:3001/api (Swagger)

## Deployment

**Live URLs:**
- Frontend: https://minibankplat.vercel.app
- Backend: https://minibankplatform.onrender.com
- API Docs: https://minibankplatform.onrender.com/api

The app is deployed using:
- Vercel for the frontend (auto-deploys from `main` branch)
- Render for the backend (auto-deploys from `main` branch)
- Render PostgreSQL for the database
