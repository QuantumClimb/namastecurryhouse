# Neon Database Connection Guide

## Project Details
- **Neon Project ID**: late-math-02754704
- **Current Status**: Database connection failing
- **Connection String**: Needs to be retrieved from console

## Manual Setup Steps

### 1. Get Connection String from Neon Console

1. Visit: https://console.neon.tech/app/projects/late-math-02754704
2. Navigate to "Dashboard" 
3. Click "Connection Details" or "Connect"
4. Copy the **Connection String** (should look like):
   ```
   postgresql://neondb_owner:REAL_PASSWORD@ep-green-heart-agnkym2y-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

### 2. Update Environment Variables

Replace the `DATABASE_URL` in `.env` file with the real connection string:

```env
# Replace this line:
DATABASE_URL="file:./dev.db"

# With your real Neon connection string:
DATABASE_URL="postgresql://neondb_owner:REAL_PASSWORD@ep-green-heart-agnkym2y-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

### 3. Test Database Connection

```bash
# Test connection
npx prisma db push

# Seed data if needed
npm run db:seed
```

### 4. Verify Admin Endpoints

```bash
# Start servers
npm run dev:full

# Test admin endpoints
curl http://localhost:3001/api/admin/categories
curl http://localhost:3001/api/admin/menu-items
```

## Alternative CLI Installation

If you want to use CLI later:

```bash
# Install globally with different method
npm install -g neonctl

# Or use via npx
npx neonctl auth
npx neonctl projects list
npx neonctl connection-string late-math-02754704
```

## Troubleshooting

### If database connection fails:
1. Check if Neon project is active
2. Verify connection string format
3. Ensure no extra spaces in .env file
4. Check if database has been migrated

### If admin endpoints fail:
1. Verify server is running on port 3001
2. Check CORS settings
3. Ensure database has proper schema
4. Check if menu data is populated