# Neon Migration Guide

## For Production Deployment with Neon:

1. **Create a Neon database:**
   - Sign up at https://neon.tech
   - Create a new project
   - Copy your connection string

2. **Update Prisma schema for PostgreSQL:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Update environment variables:**
   ```bash
   DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
   ```

4. **Run migration to Neon:**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   node scripts/importMenuData.cjs
   ```

5. **Deploy to Vercel/Netlify:**
   - Set environment variables in deployment platform
   - The API will automatically work with your React app

## Local Development:
```bash
npm run dev:full  # Runs both frontend and backend
```

## API Endpoints:
- GET /api/menu - All categories with items
- GET /api/menu/category/:name - Items by category
- GET /api/menu/search?q=query - Search items