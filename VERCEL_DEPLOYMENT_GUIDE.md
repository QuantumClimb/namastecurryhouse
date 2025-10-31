# Vercel Deployment Guide

## Current Status
- ✅ Local development working with Neon database
- ❌ Production deployment needs environment variable fix

## Problem Identified
The admin panel fails in production because:
- **Local**: API calls use `http://localhost:3001/api`
- **Production**: Should use `https://namastecurryhouse.vercel.app/api`

## Solutions Implemented

### 1. ✅ Centralized API Configuration
Created `src/lib/apiConfig.ts` to handle environment-specific URLs:

```typescript
// Automatically uses:
// - VITE_API_URL if set
// - Local proxy in development
// - Relative paths in production
```

### 2. ✅ Updated Components
- Fixed `menuService.ts` to use centralized config
- Fixed `MenuManagement.tsx` to use centralized config
- All hardcoded `localhost:3001` URLs replaced

### 3. 🔧 Vercel Environment Variables Needed

Set these in your Vercel project dashboard:

```env
DATABASE_URL=postgresql://neondb_owner:npg_naN0htcZIP1T@ep-green-heart-agnkym2y-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

VITE_API_URL=https://namastecurryhouse.vercel.app/api

PORT=3001
FRONTEND_URL=https://namastecurryhouse.vercel.app
```

## Deployment Steps

### Option 1: Via Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel login
vercel --prod
```

### Option 2: Via GitHub Integration
1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Push to main branch for auto-deployment

### Option 3: Manual Environment Setup
1. Go to: https://vercel.com/quantumclimb/namastecurryhouse/settings/environment-variables
2. Add the environment variables listed above
3. Redeploy

## Verification

After deployment, test:
1. ✅ Frontend: https://namastecurryhouse.vercel.app
2. ✅ API: https://namastecurryhouse.vercel.app/api/menu
3. ✅ Admin: https://namastecurryhouse.vercel.app/admin

## Local Development

For local development, use:
```bash
# Runs on localhost with proxy
npm run dev:full

# URLs:
# Frontend: http://localhost:8080
# Backend: http://localhost:3001
# Admin: http://localhost:8080/admin
```