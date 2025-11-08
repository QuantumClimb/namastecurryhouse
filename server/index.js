// server/index.js - Express API server for menu data
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const prisma = new PrismaClient({
  log: ['warn', 'error']
});

// Restaurant contact info
const RESTAURANT_WHATSAPP = process.env.RESTAURANT_WHATSAPP || '+351920617185';
const RESTAURANT_EMAIL = process.env.RESTAURANT_EMAIL || 'namastecurrylisboa@gmail.com';

// RESEND TEST MODE: Send all emails to account owner until domain is verified
// Set to true to test email flow, false for production with verified domain
const RESEND_TEST_MODE = process.env.RESEND_TEST_MODE === 'true' || true; // Default to test mode
const RESEND_TEST_EMAIL = 'juncando@gmail.com'; // Resend account owner email

// Initialize Resend (for email notifications)
let resend = null;
if (process.env.RESEND_API_KEY) {
  try {
    resend = new Resend(process.env.RESEND_API_KEY);
    console.log('✅ Resend initialized for email notifications');
    if (RESEND_TEST_MODE) {
      console.log('⚠️  RESEND TEST MODE: All emails will be sent to', RESEND_TEST_EMAIL);
      console.log('   Set RESEND_TEST_MODE=false after verifying domain');
    }
  } catch (error) {
    console.warn('⚠️  Resend initialization failed:', error.message);
  }
} else {
  console.warn('⚠️  Resend not configured - email notifications will not work');
}

// Initialize Stripe (only if key is configured)
let stripe = null;
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_YOUR_SECRET_KEY_HERE') {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });
    console.log('✅ Stripe initialized');
  } catch (error) {
    console.warn('⚠️  Stripe initialization failed:', error.message);
  }
} else {
  console.warn('⚠️  Stripe not configured - payment endpoints will not work');
}

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

    // Handle both data URI format and raw base64
    let base64Data = item.imageData;
    if (base64Data.startsWith('data:')) {
      // Extract base64 from data URI: data:image/jpeg;base64,/9j/4AAQ...
      const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        base64Data = matches[2];
      }
    }

    // Convert base64 to buffer and send as image
    const imageBuffer = Buffer.from(base64Data, 'base64');
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
        hasSpiceCustomization: item.hasSpiceCustomization || false,
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
      hasSpiceCustomization: item.hasSpiceCustomization || false,
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
      hasSpiceCustomization: item.hasSpiceCustomization || false,
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
      },
      include: {
        _count: {
          select: { items: true }
        }
      }
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create new category
app.post('/api/admin/categories', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    const { name } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check if category already exists
    const existingCategory = await prisma.menuCategory.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive'
        }
      }
    });

    if (existingCategory) {
      return res.status(409).json({ error: 'Category already exists' });
    }

    const newCategory = await prisma.menuCategory.create({
      data: {
        name: name.trim()
      },
      include: {
        _count: {
          select: { items: true }
        }
      }
    });

    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
app.put('/api/admin/categories/:id', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check if another category with this name exists
    const existingCategory = await prisma.menuCategory.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive'
        },
        NOT: {
          id: parseInt(id)
        }
      }
    });

    if (existingCategory) {
      return res.status(409).json({ error: 'Category name already exists' });
    }

    const updatedCategory = await prisma.menuCategory.update({
      where: { id: parseInt(id) },
      data: { name: name.trim() },
      include: {
        _count: {
          select: { items: true }
        }
      }
    });

    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
app.delete('/api/admin/categories/:id', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    const { id } = req.params;

    // Check if category has any menu items
    const category = await prisma.menuCategory.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { items: true }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (category._count.items > 0) {
      return res.status(409).json({ 
        error: `Cannot delete category with ${category._count.items} menu item(s). Please move or delete the items first.` 
      });
    }

    await prisma.menuCategory.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Create new menu item
app.post('/api/admin/menu-items', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }
    const { name, description, price, dietary, hasSpiceCustomization, categoryId, imageUrl, imageData, imageMimeType, imageSize } = req.body;
    
    const newItem = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        dietary: Array.isArray(dietary) ? dietary.join(',') : dietary || '',
        hasSpiceCustomization: hasSpiceCustomization || false,
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
      hasSpiceCustomization: newItem.hasSpiceCustomization,
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
    const { name, description, price, dietary, hasSpiceCustomization, categoryId, imageUrl, imageData, imageMimeType, imageSize } = req.body;
    
    const updatedItem = await prisma.menuItem.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price: parseFloat(price),
        dietary: Array.isArray(dietary) ? dietary.join(',') : dietary || '',
        hasSpiceCustomization: hasSpiceCustomization || false,
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
      hasSpiceCustomization: updatedItem.hasSpiceCustomization,
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
      hasSpiceCustomization: item.hasSpiceCustomization || false,
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

// ============================================================================
// STRIPE & ORDER MANAGEMENT
// ============================================================================

// Helper: Generate unique order number
function generateOrderNumber() {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${dateStr}-${random}`;
}

// Helper: Calculate delivery fee
function calculateDeliveryFee(address) {
  // Simple flat rate for now - can be enhanced with distance calculation
  return 2.50; // €2.50 delivery fee
}

// Helper: Format order for WhatsApp message
function formatOrderForWhatsApp(order) {
  const items = order.orderItems.map(item => 
    `• ${item.quantity}x ${item.name} (€${item.totalPrice.toFixed(2)})${item.spiceLevel !== undefined ? ` - ${item.spiceLevel}% spice` : ''}`
  ).join('\n');
  
  const address = typeof order.deliveryAddress === 'string' 
    ? order.deliveryAddress 
    : `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.postalCode}`;
  
  return `🔔 *NEW ORDER - ${order.orderNumber}*

👤 *Customer:* ${order.customerName}
📞 *Phone:* ${order.customerPhone}
📧 *Email:* ${order.customerEmail}

📦 *Items:*
${items}

💰 *Subtotal:* €${order.subtotal.toFixed(2)}
🚚 *Delivery:* €${order.deliveryFee.toFixed(2)}
💳 *Total:* €${order.total.toFixed(2)}

📍 *Delivery Address:*
${address}

💳 *Payment:* ${order.paymentMethod === 'STRIPE_CARD' ? 'Card (PAID ✅)' : 'Cash on Delivery'}
📊 *Status:* ${order.status}`;
}

// Helper: Send WhatsApp notification (console log + link for manual sending)
function logWhatsAppNotification(order) {
  const message = formatOrderForWhatsApp(order);
  const encodedMessage = encodeURIComponent(message);
  const whatsappLink = `https://wa.me/${RESTAURANT_WHATSAPP.replace(/\+/g, '')}?text=${encodedMessage}`;
  
  console.log('\n📱 ═══════════════════════════════════════════');
  console.log('   WHATSAPP NOTIFICATION');
  console.log('   ═══════════════════════════════════════════');
  console.log(message);
  console.log('   ═══════════════════════════════════════════');
  console.log(`   🔗 Send manually: ${whatsappLink}`);
  console.log('   ═══════════════════════════════════════════\n');
  
  return whatsappLink;
}

// Helper: Send email notification to customer
async function sendCustomerConfirmationEmail(order) {
  if (!resend) {
    console.warn('⚠️  Resend not configured - skipping customer email');
    return null;
  }

  try {
    const orderItemsHtml = order.orderItems.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          ${item.name}
          ${item.spiceLevel ? `<br><small style="color: #6b7280;">Spice Level: ${item.spiceLevel}</small>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">€${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const deliveryAddress = order.deliveryAddress;
    const addressHtml = `
      ${deliveryAddress.street}${deliveryAddress.apartment ? `, ${deliveryAddress.apartment}` : ''}<br>
      ${deliveryAddress.city}, ${deliveryAddress.postalCode}<br>
      ${deliveryAddress.country}
    `;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: #000000; color: #D4AF37; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-family: 'Forum', serif;">Namaste Curry House</h1>
          <p style="margin: 10px 0 0; font-size: 16px;">Order Confirmation</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          ${RESEND_TEST_MODE ? `
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 0 0 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #92400e;">⚠️ TEST MODE</p>
            <p style="margin: 5px 0 0; color: #92400e; font-size: 13px;">This email was sent to ${RESEND_TEST_EMAIL} for testing. Original recipient: ${order.customerEmail}</p>
          </div>
          ` : ''}
          <p style="font-size: 18px; color: #059669; font-weight: bold; margin-top: 0;">✓ Order Confirmed!</p>
          
          <p>Dear ${order.customerName},</p>
          
          <p>Thank you for your order! We've received your payment and are preparing your delicious meal.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #374151;">Order Number:</p>
            <p style="margin: 5px 0 0; font-size: 20px; color: #D4AF37;">${order.orderNumber}</p>
          </div>

          <h2 style="color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">Order Details</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #D4AF37;">Item</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #D4AF37;">Qty</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #D4AF37;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #D4AF37;">Subtotal:</td>
                <td style="padding: 12px; text-align: right; border-top: 2px solid #D4AF37;">€${order.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold;">Delivery Fee:</td>
                <td style="padding: 12px; text-align: right;">€${order.deliveryFee.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px; color: #D4AF37;">Total:</td>
                <td style="padding: 12px; text-align: right; font-size: 18px; font-weight: bold; color: #D4AF37;">€${order.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <h2 style="color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; margin-top: 30px;">Delivery Address</h2>
          <p style="margin: 15px 0; line-height: 1.8;">${addressHtml}</p>
          ${order.deliveryInstructions ? `
            <p style="margin: 15px 0;"><strong>Delivery Instructions:</strong><br>${order.deliveryInstructions}</p>
          ` : ''}

          <h2 style="color: #D4AF37; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; margin-top: 30px;">What Happens Next?</h2>
          <ol style="line-height: 2;">
            <li>Our kitchen is preparing your order</li>
            <li>We'll send it out for delivery soon</li>
            <li>Expected delivery: 30-45 minutes</li>
          </ol>

          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>Need to change something?</strong><br>
            Contact us immediately at <a href="tel:${RESTAURANT_WHATSAPP}" style="color: #D4AF37;">${RESTAURANT_WHATSAPP}</a></p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <div style="text-align: center; color: #6b7280; font-size: 14px;">
            <p><strong>Namaste Curry House</strong></p>
            <p>Authentic Indian Cuisine in Portugal</p>
            <p>Phone: ${RESTAURANT_WHATSAPP} | Email: ${RESTAURANT_EMAIL}</p>
            <p style="margin-top: 20px;">Thank you for choosing us! 🙏</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: 'Namaste Curry House <onboarding@resend.dev>',
      to: RESEND_TEST_MODE ? RESEND_TEST_EMAIL : order.customerEmail,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: htmlContent,
    });

    const emailTo = RESEND_TEST_MODE ? RESEND_TEST_EMAIL : order.customerEmail;
    console.log(`✅ Customer confirmation email sent to ${emailTo}${RESEND_TEST_MODE ? ' (TEST MODE)' : ''}`);
    if (RESEND_TEST_MODE && order.customerEmail !== RESEND_TEST_EMAIL) {
      console.log(`   (Original recipient: ${order.customerEmail})`);
    }
    return result;
  } catch (error) {
    console.error('❌ Error sending customer email:', error);
    return null;
  }
}

// Helper: Send email notification to restaurant owner
async function sendOwnerNotificationEmail(order) {
  if (!resend) {
    console.warn('⚠️  Resend not configured - skipping owner email');
    return null;
  }

  try {
    const orderItemsText = order.orderItems.map(item => 
      `${item.quantity}x ${item.name}${item.spiceLevel ? ` (${item.spiceLevel})` : ''} - €${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const deliveryAddress = order.deliveryAddress;
    const addressText = `${deliveryAddress.street}${deliveryAddress.apartment ? `, ${deliveryAddress.apartment}` : ''}, ${deliveryAddress.city}, ${deliveryAddress.postalCode}, ${deliveryAddress.country}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🔔 NEW ORDER RECEIVED</h1>
          <p style="margin: 10px 0 0; font-size: 18px; font-weight: bold;">${order.orderNumber}</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          ${RESEND_TEST_MODE ? `
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 0 0 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #92400e;">⚠️ TEST MODE</p>
            <p style="margin: 5px 0 0; color: #92400e; font-size: 13px;">This email was sent to ${RESEND_TEST_EMAIL} for testing. Original recipient: ${RESTAURANT_EMAIL}</p>
          </div>
          ` : ''}
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 18px; font-weight: bold; color: #dc2626;">ACTION REQUIRED: Prepare Order</p>
            <p style="margin: 5px 0 0; color: #991b1b;">Order Time: ${new Date(order.createdAt).toLocaleString('en-GB', { timeZone: 'Europe/Lisbon' })}</p>
          </div>

          <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">Customer Information</h2>
          <table style="width: 100%; margin: 15px 0;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Name:</td>
              <td style="padding: 8px 0;">${order.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
              <td style="padding: 8px 0;"><a href="tel:${order.customerPhone}" style="color: #dc2626;">${order.customerPhone}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;">${order.customerEmail}</td>
            </tr>
          </table>

          <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px; margin-top: 25px;">Order Items</h2>
          <pre style="background-color: #f9fafb; padding: 15px; border-radius: 6px; white-space: pre-wrap; font-size: 14px; line-height: 1.8;">${orderItemsText}</pre>
          
          <table style="width: 100%; margin: 15px 0; font-size: 16px;">
            <tr>
              <td style="padding: 8px 0; text-align: right; font-weight: bold;">Subtotal:</td>
              <td style="padding: 8px 0 8px 20px; text-align: right; width: 100px;">€${order.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; text-align: right; font-weight: bold;">Delivery Fee:</td>
              <td style="padding: 8px 0 8px 20px; text-align: right;">€${order.deliveryFee.toFixed(2)}</td>
            </tr>
            <tr style="border-top: 2px solid #dc2626;">
              <td style="padding: 12px 0; text-align: right; font-weight: bold; font-size: 18px; color: #dc2626;">TOTAL:</td>
              <td style="padding: 12px 0 12px 20px; text-align: right; font-size: 18px; font-weight: bold; color: #dc2626;">€${order.total.toFixed(2)}</td>
            </tr>
          </table>

          <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px; margin-top: 25px;">Delivery Address</h2>
          <p style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin: 15px 0; line-height: 1.8; font-size: 15px;">${addressText}</p>
          
          ${order.deliveryInstructions ? `
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; color: #92400e;">Delivery Instructions:</p>
              <p style="margin: 5px 0 0; color: #92400e;">${order.deliveryInstructions}</p>
            </div>
          ` : ''}

          <div style="background-color: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #166534;">Payment Status:</p>
            <p style="margin: 5px 0 0; color: #166534; font-size: 18px; font-weight: bold;">✓ PAID (${order.paymentMethod})</p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <div style="text-align: center;">
            <a href="https://www.namastecurry.house/admin#orders" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px;">View in Admin Dashboard</a>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: 'Namaste Orders <onboarding@resend.dev>',
      to: RESEND_TEST_MODE ? RESEND_TEST_EMAIL : RESTAURANT_EMAIL,
      subject: `🔔 NEW ORDER: ${order.orderNumber} - €${order.total.toFixed(2)}`,
      html: htmlContent,
    });

    const emailTo = RESEND_TEST_MODE ? RESEND_TEST_EMAIL : RESTAURANT_EMAIL;
    console.log(`✅ Owner notification email sent to ${emailTo}${RESEND_TEST_MODE ? ' (TEST MODE)' : ''}`);
    if (RESEND_TEST_MODE && RESTAURANT_EMAIL !== RESEND_TEST_EMAIL) {
      console.log(`   (Original recipient: ${RESTAURANT_EMAIL})`);
    }
    return result;
  } catch (error) {
    console.error('❌ Error sending owner email:', error);
    return null;
  }
}

// GET /api/stripe/config - Get publishable key for frontend
app.get('/api/stripe/config', (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe not configured' });
  }
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

// GET /api/stripe/health - Diagnostic endpoint (does not expose sensitive data)
app.get('/api/stripe/health', (req, res) => {
  const secretKeySet = !!process.env.STRIPE_SECRET_KEY;
  const publishableKeySet = !!process.env.STRIPE_PUBLISHABLE_KEY;
  const webhookSecretSet = !!process.env.STRIPE_WEBHOOK_SECRET;
  const currencySet = !!process.env.STRIPE_CURRENCY;
  
  res.json({
    stripeInitialized: !!stripe,
    environment: {
      STRIPE_SECRET_KEY: secretKeySet ? 'SET (' + process.env.STRIPE_SECRET_KEY.substring(0, 12) + '...)' : 'NOT SET',
      STRIPE_PUBLISHABLE_KEY: publishableKeySet ? 'SET (' + process.env.STRIPE_PUBLISHABLE_KEY.substring(0, 12) + '...)' : 'NOT SET',
      STRIPE_WEBHOOK_SECRET: webhookSecretSet ? 'SET' : 'NOT SET',
      STRIPE_CURRENCY: process.env.STRIPE_CURRENCY || 'NOT SET',
    },
    secretKeyIsTestMode: process.env.STRIPE_SECRET_KEY?.includes('_test_') || false,
    publishableKeyIsTestMode: process.env.STRIPE_PUBLISHABLE_KEY?.includes('_test_') || false,
  });
});

// POST /api/stripe/create-checkout-session
app.post('/api/stripe/create-checkout-session', express.json(), async (req, res) => {
  try {
    if (!stripe) {
      console.error('❌ Stripe not initialized - check STRIPE_SECRET_KEY environment variable');
      return res.status(503).json({ 
        error: 'Stripe not configured',
        details: 'Payment service is not available. Please contact support.'
      });
    }
    
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const { orderItems, customerInfo, deliveryAddress } = req.body;
    
    // Validate input
    if (!orderItems || !orderItems.length) {
      return res.status(400).json({ error: 'Order items are required' });
    }
    
    if (!customerInfo || !customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      return res.status(400).json({ error: 'Customer information is incomplete' });
    }
    
    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.postalCode) {
      return res.status(400).json({ error: 'Delivery address is incomplete' });
    }
    
    // Calculate totals
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const deliveryFee = calculateDeliveryFee(deliveryAddress);
    const total = subtotal + deliveryFee;
    
    // Create order in database
    const orderNumber = generateOrderNumber();
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        deliveryAddress: deliveryAddress,
        orderItems: orderItems,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: 'STRIPE_CARD',
      },
    });
    
    // Create line items for Stripe Checkout
    const lineItems = orderItems.map(item => ({
      price_data: {
        currency: process.env.STRIPE_CURRENCY || 'eur',
        unit_amount: Math.round((item.totalPrice / item.quantity) * 100), // Price per item in cents
        product_data: {
          name: item.name,
          description: item.spiceLevel !== undefined ? `Spice Level: ${item.spiceLevel}%` : undefined,
        },
      },
      quantity: item.quantity,
    }));
    
    // Add delivery fee as a line item
    if (deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: process.env.STRIPE_CURRENCY || 'eur',
          unit_amount: Math.round(deliveryFee * 100),
          product_data: {
            name: 'Delivery Fee',
            description: 'Home delivery service',
          },
        },
        quantity: 1,
      });
    }
    
    // Get the base URL for redirects
    const baseUrl = process.env.FRONTEND_URL || 'https://www.namastecurry.house';
    
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/order-confirmation?session_id={CHECKOUT_SESSION_ID}&order_number=${order.orderNumber}`,
      cancel_url: `${baseUrl}/checkout?canceled=true`,
      customer_email: customerInfo.email,
      client_reference_id: order.id.toString(),
      metadata: {
        orderId: order.id.toString(),
        orderNumber: order.orderNumber,
        customerPhone: customerInfo.phone,
      },
      billing_address_collection: 'auto',
      shipping_address_collection: {
        allowed_countries: ['PT'], // Portugal only for now
      },
      payment_intent_data: {
        receipt_email: customerInfo.email, // Ensure receipt email is sent
      },
    });
    
    // Update order with session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { 
        stripePaymentIntentId: session.payment_intent, // Will be set after payment
        stripeSessionId: session.id 
      },
    });
    
    console.log(`✅ Checkout session created for order ${order.orderNumber}`);
    
    res.json({
      sessionId: session.id,
      url: session.url,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: total,
    });
    
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    });
    
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message || 'An unexpected error occurred'
    });
  }
});

// POST /api/stripe/webhook - Handle Stripe webhooks
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ error: 'Stripe not configured' });
  }
  
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleCheckoutSessionCompleted(session);
        break;
        
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        await handlePaymentSuccess(paymentIntent);
        break;
        
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        await handlePaymentFailure(failedPayment);
        break;
        
      case 'charge.succeeded':
        const charge = event.data.object;
        await handleChargeSuccess(charge);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Helper: Handle checkout session completed
async function handleCheckoutSessionCompleted(session) {
  try {
    if (!(await ensureDbConnection())) {
      console.error('Database unavailable for checkout session handling');
      return;
    }

    // Find order by session ID
    const order = await prisma.order.findFirst({
      where: { stripeSessionId: session.id },
    });
    
    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'SUCCEEDED',
          status: 'CONFIRMED',
          confirmedAt: new Date(),
          stripePaymentIntentId: session.payment_intent, // Now we have the payment intent ID
        },
      });
      
      console.log(`✅ Checkout completed for order ${order.orderNumber}`);
      
      // Get updated order with all details
      const updatedOrder = await prisma.order.findUnique({
        where: { id: order.id },
      });
      
      // Send WhatsApp notification to restaurant
      logWhatsAppNotification(updatedOrder);
      
      // Send email notifications
      await sendCustomerConfirmationEmail(updatedOrder);
      await sendOwnerNotificationEmail(updatedOrder);
    } else {
      console.warn(`⚠️  Order not found for session: ${session.id}`);
    }
  } catch (error) {
    console.error('Error handling checkout session:', error);
  }
}

// Helper: Handle successful payment
async function handlePaymentSuccess(paymentIntent) {
  try {
    if (!(await ensureDbConnection())) {
      console.error('Database unavailable for payment success handling');
      return;
    }

    const order = await prisma.order.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });
    
    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'SUCCEEDED',
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
      });
      
      console.log(`✅ Payment succeeded for order ${order.orderNumber}`);
      
      // Get updated order with all details
      const updatedOrder = await prisma.order.findUnique({
        where: { id: order.id },
      });
      
      // Send WhatsApp notification to restaurant
      logWhatsAppNotification(updatedOrder);
      
      // Send email notifications
      await sendCustomerConfirmationEmail(updatedOrder);
      await sendOwnerNotificationEmail(updatedOrder);
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
}

// Helper: Handle failed payment
async function handlePaymentFailure(paymentIntent) {
  try {
    if (!(await ensureDbConnection())) {
      console.error('Database unavailable for payment failure handling');
      return;
    }

    const order = await prisma.order.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    });
    
    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'FAILED',
          status: 'CANCELLED',
        },
      });
      
      console.log(`❌ Payment failed for order ${order.orderNumber}`);
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

// Helper: Handle charge success (for charge ID)
async function handleChargeSuccess(charge) {
  try {
    if (!(await ensureDbConnection())) {
      return;
    }

    const order = await prisma.order.findFirst({
      where: { stripePaymentIntentId: charge.payment_intent },
    });
    
    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: { stripeChargeId: charge.id },
      });
    }
  } catch (error) {
    console.error('Error handling charge success:', error);
  }
}

// GET /api/orders - Get all orders (for admin)
app.get('/api/orders', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 100 // Last 100 orders
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - Get order by ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const orderId = parseInt(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// GET /api/orders/number/:orderNumber - Get order by order number
app.get('/api/orders/number/:orderNumber', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// GET /api/orders/:id/whatsapp-link - Generate WhatsApp notification link for an order
app.get('/api/orders/:id/whatsapp-link', async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const orderId = parseInt(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const message = formatOrderForWhatsApp(order);
    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/${RESTAURANT_WHATSAPP.replace(/\+/g, '')}?text=${encodedMessage}`;
    
    res.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      whatsappLink,
      message,
      restaurantWhatsApp: RESTAURANT_WHATSAPP
    });
  } catch (error) {
    console.error('Error generating WhatsApp link:', error);
    res.status(500).json({ error: 'Failed to generate WhatsApp link' });
  }
});

// POST /api/orders/whatsapp - Create order via WhatsApp
app.post('/api/orders/whatsapp', express.json(), async (req, res) => {
  try {
    if (!(await ensureDbConnection())) {
      return res.status(503).json({ error: 'Database unavailable' });
    }

    const { orderItems, customerInfo, deliveryAddress } = req.body;
    
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const deliveryFee = calculateDeliveryFee(deliveryAddress);
    const total = subtotal + deliveryFee;
    const orderNumber = generateOrderNumber();
    
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email || '',
        customerPhone: customerInfo.phone,
        deliveryAddress: deliveryAddress,
        orderItems: orderItems,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: 'WHATSAPP',
      },
    });
    
    console.log(`📱 WhatsApp order created: ${order.orderNumber}`);
    
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error creating WhatsApp order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

// Export for Vercel serverless
export default app;

// Start server only when not in Vercel serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
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
}