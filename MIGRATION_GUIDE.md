# Namaste Curry House - Project Migration Guide

## Overview
This guide will help you migrate the Namaste Curry House project to a new development machine for final handoff and deployment.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Project Installation](#project-installation)
4. [Database Configuration](#database-configuration)
5. [Environment Variables](#environment-variables)
6. [Development Server](#development-server)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software
- **Node.js**: v18.x or higher ([Download](https://nodejs.org/))
- **Git**: Latest version ([Download](https://git-scm.com/))
- **Package Manager**: npm (comes with Node.js) or Bun (optional)
- **Code Editor**: VS Code recommended ([Download](https://code.visualstudio.com/))

### Required Accounts
- **GitHub**: Access to repository `QuantumClimb/namastecurryhouse`
- **Vercel**: For hosting ([https://vercel.com](https://vercel.com))
- **Neon Database**: For PostgreSQL database ([https://neon.tech](https://neon.tech))
- **Stripe**: For payment processing ([https://stripe.com](https://stripe.com))

---

## Environment Setup

### 1. Install Node.js and npm
```bash
# Verify installation
node --version  # Should be v18.x or higher
npm --version   # Should be v9.x or higher
```

### 2. Install Git
```bash
# Verify installation
git --version
```

### 3. Configure Git (if not already done)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## Project Installation

### 1. Clone the Repository
```bash
# Navigate to your projects directory
cd /path/to/your/projects

# Clone the repository
git clone https://github.com/QuantumClimb/namastecurryhouse.git

# Navigate into the project
cd namastecurryhouse
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# OR using Bun (if preferred)
bun install
```

---

## Database Configuration

### Database Provider: Neon PostgreSQL

The project uses **Neon** as the serverless PostgreSQL database provider.

### 1. Access Neon Dashboard
- Go to [https://console.neon.tech](https://console.neon.tech)
- Log in to your account
- Select your project: **namastecurryhouse**

### 2. Get Database Connection String
- In Neon Dashboard, go to **Connection Details**
- Copy the **Connection String** (it should look like):
  ```
  postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/namastecurry?sslmode=require
  ```

### 3. Database Schema
The database is managed using **Prisma ORM**. Schema is located at:
```
prisma/schema.prisma
```

**Main Tables:**
- `MenuItem` - Menu items with prices, descriptions, images
- `MenuCategory` - Categories for organizing menu items
- `ImageStorage` - Stores uploaded images (base64)
- `Order` - Customer orders
- `Customer` - Customer information
- `OrderItem` - Individual items in orders

---

## Environment Variables

### 1. Create `.env` File
Create a `.env` file in the project root:

```bash
# Navigate to project root
cd namastecurryhouse

# Create .env file (Windows PowerShell)
New-Item -Path .env -ItemType File

# OR (Mac/Linux)
touch .env
```

### 2. Add Environment Variables
Edit the `.env` file and add the following:

```env
# Database
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/namastecurry?sslmode=require"

# Stripe (Production)
VITE_STRIPE_PUBLIC_KEY="pk_live_YOUR_STRIPE_PUBLIC_KEY"
STRIPE_SECRET_KEY="sk_live_YOUR_STRIPE_SECRET_KEY"

# Stripe (Test - for development)
# VITE_STRIPE_PUBLIC_KEY="pk_test_YOUR_STRIPE_TEST_KEY"
# STRIPE_SECRET_KEY="sk_test_YOUR_STRIPE_TEST_SECRET"

# API Configuration
VITE_API_URL="https://namastecurry.house/api"

# Admin Authentication (Optional)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your_secure_password_here"
```

### 3. Important Notes
- **NEVER** commit `.env` to Git (it's already in `.gitignore`)
- Keep production keys separate from test keys
- Update `DATABASE_URL` with your actual Neon connection string
- Update Stripe keys from your Stripe Dashboard

---

## Development Server

### 1. Run Database Migrations
Before starting the dev server, ensure database schema is up to date:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (if needed)
npx prisma migrate deploy

# OR reset database (WARNING: deletes all data)
# npx prisma migrate reset
```

### 2. Start Development Server

#### Option A: Using npm
```bash
npm run dev
```

#### Option B: Using the batch file (Windows)
```bash
.\dev.bat
```

#### Option C: Using Bun
```bash
bun run dev
```

### 3. Access the Application
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **API**: [http://localhost:5173/api](http://localhost:5173/api)

---

## Production Deployment

### Hosting Platform: Vercel

The project is deployed on **Vercel** with serverless functions.

### 1. Vercel Setup

#### Install Vercel CLI (optional)
```bash
npm install -g vercel
```

#### Login to Vercel
```bash
vercel login
```

### 2. Connect Repository to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import `QuantumClimb/namastecurryhouse` repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. Add Environment Variables in Vercel

In Vercel Dashboard → Project Settings → Environment Variables, add:

```
DATABASE_URL = postgresql://...
VITE_STRIPE_PUBLIC_KEY = pk_live_...
STRIPE_SECRET_KEY = sk_live_...
VITE_API_URL = https://namastecurry.house/api
ADMIN_USERNAME = admin
ADMIN_PASSWORD = your_password
```

### 4. Deploy

#### Automatic Deployment
- Push to `main` branch triggers automatic deployment
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

#### Manual Deployment
```bash
vercel --prod
```

### 5. Custom Domain
- Domain: **namastecurry.house**
- Configure in Vercel Dashboard → Domains
- Add DNS records as instructed by Vercel

---

## Project Structure

```
namastecurryhouse/
├── api/                      # Serverless API routes (Vercel)
│   ├── [...path].js         # Catch-all API route
│   └── index.js             # API entry point
├── docs/                    # Documentation
│   ├── ADMIN.md
│   ├── STRIPE_INTEGRATION.md
│   └── ...
├── prisma/                  # Database schema and migrations
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Migration history
├── public/                  # Static assets
│   ├── images/              # Image assets
│   └── menuData.json        # Fallback menu data
├── server/                  # Local development server
│   └── index.js
├── src/                     # React application source
│   ├── components/          # React components
│   │   ├── AddToCartButton.tsx
│   │   ├── CartDrawer.tsx
│   │   ├── Navigation.tsx
│   │   ├── SpiceLevelDialog.tsx
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   │   ├── useCartQuantity.ts
│   │   └── useMenuData.ts
│   ├── pages/               # Page components
│   │   ├── Menu.tsx
│   │   ├── Checkout.tsx
│   │   ├── Contact.tsx
│   │   └── ...
│   ├── services/            # API services
│   │   └── menuService.ts
│   ├── stores/              # Zustand stores
│   │   └── cartStore.ts
│   ├── types/               # TypeScript types
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # React entry point
│   └── index.css            # Global styles
├── .env                     # Environment variables (NOT in Git)
├── .env.example             # Example environment variables
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
├── vercel.json              # Vercel deployment config
└── README.md                # Project README
```

---

## Key Features Implemented

### ✅ Core Features
- **Menu Management**: Display categorized menu items with images
- **Shopping Cart**: Add/remove items with quantity management
- **Spice Customization**: 5-level spice customization (0%, 25%, 50%, 75%, 100%)
- **Checkout**: Order processing with customer details
- **Stripe Integration**: Secure payment processing
- **Admin Panel**: Menu item management, image uploads
- **Responsive Design**: Mobile-first, works on all devices

### ✅ Technical Features
- **React Query**: Menu data preloading and caching
- **Zustand**: Global cart state management
- **Prisma ORM**: Type-safe database access
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling with OKLCH colors
- **Shadcn/ui**: High-quality UI components

### ✅ Design System
- **Primary Color**: Gold (#D4AF37 / OKLCH 0.7500 0.1200 85.0000)
- **Accent Color**: Orange
- **Background**: Black navbar/footer (#000000)
- **Typography**: Serif headings, sans-serif body

---

## Important Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Database
```bash
npx prisma generate  # Generate Prisma Client
npx prisma migrate dev  # Create and apply migrations
npx prisma migrate deploy  # Apply migrations (production)
npx prisma studio    # Open database GUI
npx prisma db push   # Push schema changes without migration
```

### Testing
```bash
node test-db.mjs     # Test database connection
node test-api.mjs    # Test API endpoints
```

---

## Troubleshooting

### Issue: Database Connection Fails

**Solution:**
1. Verify `DATABASE_URL` in `.env` is correct
2. Check Neon dashboard - ensure database is active
3. Ensure `?sslmode=require` is at the end of connection string
4. Run `npx prisma generate` to regenerate client

### Issue: Stripe Payment Not Working

**Solution:**
1. Verify Stripe keys are correct (public and secret)
2. Check if using test keys vs live keys
3. Ensure `VITE_STRIPE_PUBLIC_KEY` has `pk_` prefix
4. Check Stripe Dashboard for error logs

### Issue: Images Not Loading

**Solution:**
1. Check if images exist in database: `npx prisma studio`
2. Verify API route `/api/menu` returns image data
3. Check browser console for CORS errors
4. Ensure base64 image data is properly formatted

### Issue: Build Fails on Vercel

**Solution:**
1. Check environment variables are set in Vercel
2. Verify `vercel.json` configuration is correct
3. Check build logs in Vercel dashboard
4. Ensure all dependencies are in `package.json`

### Issue: API Routes 404 on Vercel

**Solution:**
1. Verify `vercel.json` has correct rewrites
2. Check `api/[...path].js` catch-all route exists
3. Ensure `VITE_API_URL` points to correct domain
4. Check Vercel Functions logs

---

## Database Management

### Viewing Data
```bash
# Open Prisma Studio (visual database browser)
npx prisma studio
```

### Backup Database
```bash
# Using pg_dump (if you have PostgreSQL client installed)
pg_dump DATABASE_URL > backup.sql
```

### Importing Menu Data
```bash
# Import from JSON (if needed)
node scripts/importMenuData.mjs
```

---

## Production Checklist

Before final handoff, ensure:

- [ ] All environment variables set in Vercel
- [ ] Database migrations applied to production
- [ ] Stripe configured with live keys (not test)
- [ ] Menu items populated with correct data and images
- [ ] Custom domain (namastecurry.house) configured
- [ ] SSL certificate active
- [ ] Analytics configured (if needed)
- [ ] Error tracking configured (if needed)
- [ ] Admin panel credentials secured
- [ ] Contact information updated (phone, email, address)
- [ ] WhatsApp integration working
- [ ] All pages tested on mobile and desktop
- [ ] Payment flow tested end-to-end
- [ ] Order confirmation emails working (if configured)

---

## Support and Documentation

### Additional Documentation
- [Admin Panel Guide](./docs/ADMIN.md)
- [Stripe Integration](./docs/STRIPE_INTEGRATION.md)
- [Neon Database Setup](./docs/NEON_SETUP.md)
- [Vercel Deployment](./docs/VERCEL_DEPLOYMENT_GUIDE.md)

### Useful Links
- **Live Site**: [https://namastecurry.house](https://namastecurry.house)
- **GitHub**: [https://github.com/QuantumClimb/namastecurryhouse](https://github.com/QuantumClimb/namastecurryhouse)
- **Vercel Dashboard**: [https://vercel.com/dashboard](https://vercel.com/dashboard)
- **Neon Dashboard**: [https://console.neon.tech](https://console.neon.tech)
- **Stripe Dashboard**: [https://dashboard.stripe.com](https://dashboard.stripe.com)

---

## Contact

For questions or support during migration:
- **Developer**: Available during handoff period
- **Repository**: Create issues on GitHub
- **Email**: info@namastecurryhouse.com

---

**Last Updated**: November 8, 2025
**Version**: 1.0.0
**Status**: Production Ready ✅
