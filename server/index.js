// server/index.js - Express API server for menu data
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const prisma = new PrismaClient({
  log: ['warn', 'error']
});
const PORT = process.env.PORT || 3001;

// Database connection status with lightweight retry capability
let dbConnected = false;
let lastDbCheck = 0;

// Ensure database connection (used on startup and per-request when needed)
async function ensureDbConnection(force = false) {
  const now = Date.now();
  // Avoid hammering DB: only recheck if forced or 10s have passed
  if (!force && dbConnected && now - lastDbCheck < 10_000) {
    return true;
  }
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
    return true;
  } catch (error) {
    dbConnected = false;
    console.warn('⚠️  Database check failed:', error.message);
    return false;
  } finally {
    lastDbCheck = now;
  }
}

// Configure multer for in-memory image storage (will save to database)
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 350 * 1024 // 350KB limit (allows 250KB + base64 expansion buffer)
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP image files are allowed!'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve database-stored images via base64 data URIs
app.get('/api/images/:id', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const { id } = req.params;
    const item = await prisma.menuItem.findUnique({
      where: { id: parseInt(id) },
      select: { imageData: true, imageMimeType: true }
    });

    if (!item || !item.imageData) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Convert base64 back to buffer and send as image
    const imageBuffer = Buffer.from(item.imageData, 'base64');
    res.set({
      'Content-Type': item.imageMimeType || 'image/jpeg',
      'Content-Length': imageBuffer.length,
      'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
    });
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

// Global error handler to prevent serverless hard crashes
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  // Trigger a background check but don't block health response
  ensureDbConnection().finally(() => {});
  res.json({
    status: 'OK',
    message: 'Server is running',
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

// Database diagnostics endpoint for quick monitoring
app.get('/api/db/diagnostics', async (req, res) => {
  try {
    const connected = await ensureDbConnection(true);
    if (!connected) {
      return res.status(503).json({ ok: false, reason: 'database-unavailable' });
    }

    const [versionRow] = await prisma.$queryRaw`SELECT version()`;
    const [nowRow] = await prisma.$queryRaw`SELECT NOW()`;
    const [counts] = await prisma.$queryRaw`SELECT 
      (SELECT COUNT(*) FROM "public"."MenuCategory")::int AS categories,
      (SELECT COUNT(*) FROM "public"."MenuItem")::int AS items`;

    res.json({
      ok: true,
      db: {
        connected: true,
        version: versionRow?.version || 'unknown',
        now: nowRow?.now || null,
        counts
      }
    });
  } catch (err) {
    console.error('Diagnostics error:', err);
    res.status(500).json({ ok: false, error: 'diagnostics-failed' });
  }
});

// Get all menu categories with items
app.get('/api/menu', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      // Fallback: serve static menu data bundled with the app
      try {
        const fallbackPath = path.join(__dirname, '..', 'public', 'menuData.json');
        if (fs.existsSync(fallbackPath)) {
          const json = fs.readFileSync(fallbackPath, 'utf-8');
          return res.json(JSON.parse(json));
        }
      } catch (e) {
        console.warn('Fallback menu load failed:', e.message);
      }
      return res.json([]);
    }

    const categories = await prisma.menuCategory.findMany({
      include: {
        items: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform to match frontend expectations with database-served images
    const menuData = categories.map(category => ({
      name: category.name,
      items: category.items.map(item => ({
        id: item.id.toString(),
        name: item.name,
        description: item.description,
        price: item.price,
        dietary: item.dietary ? item.dietary.split(',').filter(d => d.trim()) : [],
        spiceLevel: item.spiceLevel,
        // Use database-served image endpoint or external URL fallback
        imageUrl: item.imageData ? `/api/images/${item.id}` : item.imageUrl
      }))
    }));

    res.json(menuData);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu data' });
  }
});

// Get items by category
app.get('/api/menu/category/:categoryName', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ 
        error: 'Database unavailable',
        message: 'Please try again later or use fallback data'
      });
    }
    const { categoryName } = req.params;
    const category = await prisma.menuCategory.findFirst({
      where: {
        name: {
          equals: categoryName,
          mode: 'insensitive'
        }
      },
      include: {
        items: true
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const menuItems = category.items.map(item => ({
      id: item.id.toString(),
      name: item.name,
      description: item.description,
      price: item.price,
      dietary: item.dietary ? item.dietary.split(',').filter(d => d.trim()) : [],
      spiceLevel: item.spiceLevel,
      // Use database-served image endpoint or external URL fallback
      imageUrl: item.imageData ? `/api/images/${item.id}` : item.imageUrl
    }));

    res.json({
      category: category.name,
      items: menuItems
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category data' });
  }
});

// Search menu items
app.get('/api/menu/search', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ 
        error: 'Database unavailable',
        message: 'Please try again later'
      });
    }
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const items = await prisma.menuItem.findMany({
      where: {
        OR: [
          {
            name: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: q,
              mode: 'insensitive'
            }
          }
        ]
      },
      include: {
        category: true
      }
    });

    const searchResults = items.map(item => ({
      id: item.id.toString(),
      name: item.name,
      description: item.description,
      price: item.price,
      dietary: item.dietary ? item.dietary.split(',').filter(d => d.trim()) : [],
      spiceLevel: item.spiceLevel,
      category: item.category.name,
      imageUrl: item.imageUrl
    }));

    res.json(searchResults);
  } catch (error) {
    console.error('Error searching menu:', error);
    res.status(500).json({ error: 'Failed to search menu' });
  }
});

// ADMIN ENDPOINTS - Menu Management

// Get all categories (for admin dropdown)
app.get('/api/admin/categories', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    const categories = await prisma.menuCategory.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create new menu item
app.post('/api/admin/menu-items', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    const { name, description, price, dietary, spiceLevel, categoryId, imageUrl, imageData, imageMimeType, imageSize } = req.body;
    
    const newItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        dietary: Array.isArray(dietary) ? dietary.join(',') : dietary || '',
        spiceLevel: spiceLevel ? parseInt(spiceLevel) : null,
        categoryId: parseInt(categoryId),
        imageUrl: imageUrl || null,
        imageData: imageData || null,
        imageMimeType: imageMimeType || null,
        imageSize: imageSize ? parseInt(imageSize) : null
      },
      include: {
        category: true
      }
    });

    res.json({
      id: newItem.id.toString(),
      name: newItem.name,
      description: newItem.description,
      price: newItem.price,
      dietary: newItem.dietary ? newItem.dietary.split(',').filter(d => d.trim()) : [],
      spiceLevel: newItem.spiceLevel,
      categoryId: newItem.categoryId,
      category: newItem.category.name,
      imageUrl: newItem.imageData ? `/api/images/${newItem.id}` : newItem.imageUrl
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// Update menu item
app.put('/api/admin/menu-items/:id', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    const { id } = req.params;
    const { name, description, price, dietary, spiceLevel, categoryId, imageUrl, imageData, imageMimeType, imageSize } = req.body;
    
    const updatedItem = await prisma.menuItem.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price: parseFloat(price),
        dietary: Array.isArray(dietary) ? dietary.join(',') : dietary || '',
        spiceLevel: spiceLevel ? parseInt(spiceLevel) : null,
        categoryId: parseInt(categoryId),
        imageUrl: imageUrl || null,
        imageData: imageData || null,
        imageMimeType: imageMimeType || null,
        imageSize: imageSize ? parseInt(imageSize) : null
      },
      include: {
        category: true
      }
    });

    res.json({
      id: updatedItem.id.toString(),
      name: updatedItem.name,
      description: updatedItem.description,
      price: updatedItem.price,
      dietary: updatedItem.dietary ? updatedItem.dietary.split(',').filter(d => d.trim()) : [],
      spiceLevel: updatedItem.spiceLevel,
      categoryId: updatedItem.categoryId,
      category: updatedItem.category.name,
      imageUrl: updatedItem.imageData ? `/api/images/${updatedItem.id}` : updatedItem.imageUrl
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Delete menu item
app.delete('/api/admin/menu-items/:id', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    const { id } = req.params;
    
    // Get the item to check for legacy file-based image
    const item = await prisma.menuItem.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    // Delete the item (database-stored images are automatically removed)
    await prisma.menuItem.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// Image upload endpoint - stores directly in database
app.post('/api/admin/upload-image', (req, res) => {
  upload.single('image')(req, res, async (err) => {
    // Handle multer errors specifically
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          error: 'Image too large. Maximum file size is 250KB.' 
        });
      }
      if (err.message.includes('Only JPEG, PNG, WebP')) {
        return res.status(400).json({ 
          error: 'Invalid file type. Please use JPEG, PNG, or WebP format.' 
        });
      }
      return res.status(400).json({ 
        error: err.message || 'Invalid file upload.' 
      });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      if (!(await ensureDbConnection())) {
        return res.status(503).json({ error: 'Database unavailable' });
      }

      // Additional server-side validation
      const maxSize = 250 * 1024; // 250KB
      if (req.file.size > maxSize) {
        return res.status(400).json({ 
          error: `Image too large. Maximum size is 250KB. Your image is ${Math.round(req.file.size / 1024)}KB.` 
        });
      }

      // Convert buffer to base64 for database storage
      const imageData = req.file.buffer.toString('base64');
      const imageMimeType = req.file.mimetype;
      const imageSize = req.file.size;

      // For now, just return the image data info
      // The actual saving will happen when creating/updating menu items
      res.json({ 
        imageData,
        imageMimeType,
        imageSize,
        message: 'Image processed successfully - ready for menu item association'
      });
    } catch (error) {
      console.error('Error processing image:', error);
      res.status(500).json({ error: 'Failed to process image' });
    }
  });
});

// Get all menu items for admin (with pagination)
app.get('/api/admin/menu-items', async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;
    const offset = (page - 1) * limit;
    
    const where = category ? {
      category: {
        name: {
          equals: category,
          mode: 'insensitive'
        }
      }
    } : {};
    
    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where,
        include: {
          category: true
        },
        orderBy: {
          name: 'asc'
        },
        skip: offset,
        take: parseInt(limit)
      }),
      prisma.menuItem.count({ where })
    ]);
    
    const menuItems = items.map(item => ({
      id: item.id.toString(),
      name: item.name,
      description: item.description,
      price: item.price,
      dietary: item.dietary ? item.dietary.split(',').filter(d => d.trim()) : [],
      spiceLevel: item.spiceLevel,
      categoryId: item.categoryId,
      category: item.category.name,
      // Use database-served image endpoint or external URL fallback
      imageUrl: item.imageData ? `/api/images/${item.id}` : item.imageUrl
    }));
    
    res.json({
      items: menuItems,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching admin menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Start server
async function startServer() {
  try {
    await ensureDbConnection(true);
  } catch (error) {
    console.error('Database connection warning:', error.message);
  }
  
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Database status: ${dbConnected ? 'connected' : 'disconnected'}`);
  });
  
  // Keep reference to server to prevent process from exiting
  return server;
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});