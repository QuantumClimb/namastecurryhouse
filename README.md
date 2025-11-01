# Namaste Curry House - Restaurant Website & Admin System

A complete restaurant management system featuring a modern customer-facing website and comprehensive admin panel for menu management. Built with React, Express.js, and PostgreSQL.

## 🌟 **Current Status**: Production Ready ✅

**Live Website**: https://namastecurryhouse.vercel.app  
**Admin Panel**: https://namastecurryhouse.vercel.app/admin  
**Last Updated**: November 1, 2025

## 🚀 **Key Features**

### **Customer-Facing Website**
- **Responsive Design**: Optimized for all devices with modern UI
- **Interactive Menu**: Dynamic menu with real-time data from database
- **Image Gallery**: Database-stored images with optimized delivery
- **Reservation System**: Easy table booking functionality  
- **Contact Integration**: WhatsApp integration for quick communication
- **SPA Navigation**: Smooth routing with no page refresh issues

### **Admin Management System**
- **Secure Authentication**: 30-minute session timeout for security
- **Menu Management**: Full CRUD operations for menu items and categories
- **Image Upload**: Direct database storage with validation (250KB max, 400×300px)
- **Real-time Updates**: Changes reflect immediately on public website
- **Persistent State**: Admin views survive page refresh
- **Mobile Responsive**: Manage restaurant from any device

### **Technical Excellence**
- **Database Storage**: PostgreSQL on Neon with Prisma ORM
- **Image Optimization**: Base64 storage with size validation
- **API Security**: Protected admin endpoints with error handling
- **Production Deployment**: Auto-deploy from GitHub via Vercel
- **Session Management**: Secure time-based authentication

## 🛠 **Tech Stack**

### **Frontend**
- **React 18** with TypeScript
- **Vite** for build tooling  
- **TailwindCSS** with Shadcn/UI components
- **React Router** with hash routing for admin
- **TanStack Query** for state management

### **Backend**
- **Express.js** API server
- **Prisma ORM** for database operations
- **Multer** for image upload handling
- **PostgreSQL** on Neon cloud database

### **Deployment**
- **Vercel** for hosting and serverless functions
- **GitHub Actions** for CI/CD
- **Neon** for production database

## 📦 **Quick Setup**

### **Prerequisites**
- Node.js (v18 or higher)
- Git for version control

### **Environment Setup**

1. **Clone the repository**
   ```bash
   git clone https://github.com/QuantumClimb/namastecurryhouse.git
   cd namastecurry
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create `.env` file in root directory:
   ```bash
   DATABASE_URL="postgresql://neondb_owner:npg_naN0htcZIP1T@ep-green-heart-agnkym2y-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Test database connection
   node test-db-connection.mjs
   ```

5. **Start Development Servers**
   ```bash
   # Option 1: Both servers together
   npm run dev:full
   
   # Option 2: Separate terminals
   npm run server    # API server (localhost:3001)  
   npm run dev       # Frontend (localhost:8080)
   ```

## 🔐 **Admin Access**

**URL**: http://localhost:8080/admin (dev) or https://namastecurryhouse.vercel.app/admin (prod)

**Credentials**:
- **Username**: `NamasteAdmin`
- **Password**: `namaste123`
- **Session**: 30-minute auto-logout

**Admin Features**:
- Menu item management with image upload
- Category organization
- Real-time validation and error handling
- Persistent page state on refresh

## 📁 **Project Structure**

```
namastecurry/
├── 📄 PROJECT_STATUS.md          # Detailed project status and next steps
├── 🗄️ server/
│   └── index.js                  # Express API with image upload
├── ⚛️ src/
│   ├── components/
│   │   └── MenuManagement.tsx    # Admin interface with validation
│   ├── pages/
│   │   ├── Admin.tsx            # Secure admin panel
│   │   └── Menu.tsx             # Public menu display
│   └── services/
│       └── menuService.ts       # API communication layer
├── 🗃️ prisma/
│   ├── schema.prisma            # Database schema with image fields
│   └── migrations/              # Database version control
├── 🌐 vercel.json               # Production deployment config
└── 📋 package.json              # Scripts and dependencies
```

## 🛠 **Available Scripts**

```bash
# Development
npm run dev              # Vite dev server (localhost:8080)
npm run server           # Express API server (localhost:3001)  
npm run dev:full         # Both servers concurrently

# Production
npm run build            # Build for production
npm run vercel-build     # Vercel deployment (includes DB setup)
npm run preview          # Preview production build

# Database
npm run db:migrate       # Apply Prisma migrations
npm run db:seed          # Seed database with initial data

# Utilities  
npm run lint             # ESLint code checking
```

## 🔗 **API Endpoints**

### **Public Endpoints**
- `GET /api/health` - Server health check
- `GET /api/menu` - Public menu data with images
- `GET /api/images/{id}` - Serve database-stored images

### **Admin Endpoints** (Authentication Required)
- `GET /api/admin/menu-items` - List all menu items with pagination
- `POST /api/admin/menu-items` - Create new menu item
- `PUT /api/admin/menu-items/{id}` - Update existing menu item  
- `DELETE /api/admin/menu-items/{id}` - Delete menu item
- `POST /api/admin/upload-image` - Upload image with validation

## 📊 **Current Database Status**

**Menu Items**: 31 items across 6 categories  
**Categories**: Main Curries, Vegetarian, Beverages, Breads, Sides, Other  
**Images**: 1 database image, 30 placeholder images  
**Last Migration**: October 31, 2025

## 🎯 **Next Development Steps**

1. **Image Upload**: Add images for remaining 30 menu items
2. **Mobile Testing**: Verify admin panel responsiveness  
3. **Feature Enhancement**: Search/filter in admin panel
4. **Performance**: Optimize image delivery and caching
5. **Security**: Environment-based admin credentials

📄 **For detailed status and continuation guide, see [PROJECT_STATUS.md](./PROJECT_STATUS.md)**

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -m 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Open Pull Request

## 📄 **License**

This project is proprietary software for Namaste Curry House.

---

**🌟 Ready for Production | 🔒 Secure Admin System | 📱 Mobile Responsive | 🚀 Auto-Deployed**
