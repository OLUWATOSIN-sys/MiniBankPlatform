# Render PostgreSQL Setup Guide

## 🔧 Quick Setup Instructions

### Step 1: Get Your Database Connection Details

1. Go to your Render Dashboard: https://dashboard.render.com
2. Navigate to **minibank-postgres** database
3. Click on the **"Info"** tab
4. Under **"Connections"** section, you'll see:

```
Internal Database URL    (Use this if deploying backend on Render)
External Database URL    (Use this for local development/testing)
PSQL Command
```

### Step 2: Update Your `.env` File

Copy the appropriate Database URL from Render and update your `.env` file:

**For Production (Backend deployed on Render):**
```bash
DATABASE_URL=<PASTE_INTERNAL_DATABASE_URL_HERE>
```

**For Development/External Connection:**
```bash
DATABASE_URL=<PASTE_EXTERNAL_DATABASE_URL_HERE>
```

The Database URL format looks like:
```
postgresql://username:password@hostname:5432/database_name
```

### Step 3: Generate a Secure JWT Secret

Run this command to generate a secure JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and update in `.env`:
```bash
JWT_SECRET=<paste_generated_secret_here>
```

### Step 4: Update Frontend URL (if different)

Update the CORS configuration with your actual frontend URL:
```bash
FRONTEND_URL=https://your-actual-frontend-url.vercel.app
```

### Step 5: Verify Your Configuration

Your final `.env` file should look like:

```bash
# Application Configuration
NODE_ENV=production
PORT=10000

# Database
DATABASE_URL=postgresql://user:pass@hostname.oregon-postgres.render.com:5432/dbname

# JWT
JWT_SECRET=your_64_character_hex_string_here
JWT_EXPIRATION=24h

# Exchange Rate
USD_TO_EUR_RATE=0.92

# CORS
FRONTEND_URL=https://mini-bank-platform.vercel.app

# SSL
DATABASE_SSL=true
DATABASE_REJECT_UNAUTHORIZED=false
```

---

## 🚀 Running the Application

### Local Development with Render Database

```bash
# Install dependencies
npm install

# Run migrations (if any)
npm run typeorm migration:run

# Seed initial data
npm run seed

# Start development server
npm run start:dev
```

### Production Deployment on Render

1. **Push your code to GitHub**
2. **Create a Web Service on Render:**
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: minibank-backend
     - **Region**: Oregon (US West) - same as your database
     - **Branch**: main
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm run start:prod`

3. **Add Environment Variables in Render:**
   - Go to your web service settings
   - Click "Environment" tab
   - Add each variable from your `.env` file
   - Render will automatically provide `PORT` variable

4. **Link Database:**
   - In Environment Variables, click "Add Environment Variable"
   - Select "Add from Database"
   - Choose `minibank-postgres`
   - This will automatically add the Internal Database URL

---

## 📋 Database Information

- **Service ID**: dpg-d3oaqaqli9vc73c0257g-a
- **Region**: Oregon (US West)
- **PostgreSQL Version**: 17
- **Instance Type**: Free (256 MB RAM, 0.1 CPU, 1 GB Storage)
- **Expiration**: November 15, 2025 (upgrade to paid plan to keep)

⚠️ **Important Notes:**
- Free tier database will be deleted on November 15, 2025 unless upgraded
- SSL is required for all connections
- Connection limit on free tier is 97 concurrent connections
- Database automatically syncs schema in development mode
- Production mode uses migrations for schema changes

---

## 🔍 Troubleshooting

### Cannot Connect to Database

1. Verify your DATABASE_URL is correct
2. Check if SSL is enabled (`DATABASE_SSL=true`)
3. Ensure you're using the correct URL type:
   - Internal URL for Render-hosted services
   - External URL for local development

### SSL Connection Errors

Make sure these are set in your `.env`:
```bash
DATABASE_SSL=true
DATABASE_REJECT_UNAUTHORIZED=false
```

### Schema Not Syncing

- Development: `synchronize: true` (automatic)
- Production: Run migrations manually
```bash
npm run typeorm migration:generate -- -n InitialMigration
npm run typeorm migration:run
```

---

## 📞 Need Help?

- Render Support: https://render.com/docs/databases
- PostgreSQL Docs: https://www.postgresql.org/docs/17/
- TypeORM Docs: https://typeorm.io/

---

**Last Updated**: October 16, 2025
