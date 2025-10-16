# Mini Banking Platform

Assesment Project

## What The Mini Banking Platform Does

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

#### 1. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
**Note:** I'll send you the actual `.env` file with real values separately.

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

### Test Demo Accounts

You can try the app with these pre-configured test accounts (or create your own):

| Email | Password | USD Balance | EUR Balance |
|-------|----------|-------------|-------------|
| alice.johnson@minibank.com | password123 | $25,000 | €25,000 |
| bob.smith@minibank.com | password123 | $25,000 | €25,000 |
| charlie.brown@minibank.com | password123 | $25,000 | €25,000 |
| oluwatosin@minibank.com | password123 | $25,000 | €25,000 |

**Note:** You can also create your own account using the registration page. New accounts receive $1,000 USD and €500 EUR to start transacting.

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
