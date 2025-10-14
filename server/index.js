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
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'public', 'images', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
// Serve uploaded images
app.use('/images/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Get all menu categories with items
app.get('/api/menu', async (req, res) => {
  try {
    const categories = await prisma.menuCategory.findMany({
      include: {
        items: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transform to match frontend expectations
    const menuData = categories.map(category => ({
      name: category.name,
      items: category.items.map(item => ({
        id: item.id.toString(),
        name: item.name,
        description: item.description,
        price: item.price,
        dietary: item.dietary ? item.dietary.split(',').filter(d => d.trim()) : [],
        spiceLevel: item.spiceLevel,
        imageUrl: item.imageUrl
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
      imageUrl: item.imageUrl
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
    const { name, description, price, dietary, spiceLevel, categoryId, imageUrl } = req.body;
    
    const newItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        dietary: Array.isArray(dietary) ? dietary.join(',') : dietary || '',
        spiceLevel: spiceLevel ? parseInt(spiceLevel) : null,
        categoryId: parseInt(categoryId),
        imageUrl: imageUrl || null
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
      imageUrl: newItem.imageUrl
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// Update menu item
app.put('/api/admin/menu-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, dietary, spiceLevel, categoryId, imageUrl } = req.body;
    
    const updatedItem = await prisma.menuItem.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price: parseFloat(price),
        dietary: Array.isArray(dietary) ? dietary.join(',') : dietary || '',
        spiceLevel: spiceLevel ? parseInt(spiceLevel) : null,
        categoryId: parseInt(categoryId),
        imageUrl: imageUrl || null
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
      imageUrl: updatedItem.imageUrl
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// Delete menu item
app.delete('/api/admin/menu-items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the item to check for image
    const item = await prisma.menuItem.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }
    
    // Delete the item
    await prisma.menuItem.delete({
      where: { id: parseInt(id) }
    });
    
    // Optionally delete the image file
    if (item.imageUrl && item.imageUrl.includes('/images/uploads/')) {
      const filename = path.basename(item.imageUrl);
      const filepath = path.join(uploadsDir, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }
    
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

// Image upload endpoint
app.post('/api/admin/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    const imageUrl = `/images/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
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
      imageUrl: item.imageUrl
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
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});