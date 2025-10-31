# Integration Setup Guide - Namaste Curry House

## Current Status
- ✅ React component errors fixed (fetchPriority warning)
- ✅ Select component empty value issue fixed
- ✅ Batch scripts created for local development
- 🔄 Database connection needs Neon credentials
- 🔄 Vercel integration pending

## Neon Database Integration

### Project Details
- **Neon Project**: `late-math-02754704`
- **Current Issue**: Need real database credentials

### Steps to Connect to Neon:

1. **Get Neon CLI**
   ```bash
   npm install -g @neondatabase/cli
   # or
   curl -L https://neon.tech/install/cli | bash
   ```

2. **Login to Neon**
   ```bash
   neonctl auth
   ```

3. **Get Connection String**
   ```bash
   neonctl connection-string late-math-02754704
   ```

4. **Update .env file** with real credentials:
   ```
   DATABASE_URL="postgresql://[real-credentials-here]"
   ```

## Vercel Integration

### Repository Details
- **GitHub**: https://github.com/QuantumClimb/namastecurryhouse.git
- **User**: Quantum Climb

### Steps to Connect Vercel:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Link Project**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add DATABASE_URL_UNPOOLED
   ```

## Local Development

### Using Batch Scripts

1. **Quick Start** (recommended):
   ```cmd
   .\dev.bat
   ```

2. **Full Setup** (with browser launch):
   ```cmd
   .\start-dev.bat
   ```

### Manual Start
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend  
npm run dev
```

### URLs
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001/api
- **Admin Panel**: http://localhost:8080/admin

## Database Setup

### For Local Development (SQLite)
```bash
npx prisma db push
node scripts/importMenuData.mjs
```

### For Production (Neon)
```bash
npx prisma migrate deploy
node scripts/importMenuData.mjs
```

## Testing

### Test Database Connection
```bash
curl http://localhost:3001/api/menu
```

### Test Admin Endpoints
```bash
curl http://localhost:3001/api/admin/categories
curl http://localhost:3001/api/admin/menu-items
```

## Next Steps

1. **Get Neon credentials** using CLI
2. **Connect Vercel** to GitHub repo
3. **Test admin functionality** with proper database
4. **Deploy to production** via Vercel

## Notes

- SQLite fallback is configured for local development
- Menu data imports are working (confirmed frontend menu loads)
- Admin panel errors are due to missing API endpoints/database connection
- All React component warnings have been resolved