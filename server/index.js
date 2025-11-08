// server/index.js - Express API server for menu data
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const prisma = new PrismaClient({
  log: ['warn', 'error']
});

// Restaurant WhatsApp number for notifications
const RESTAURANT_WHATSAPP = process.env.RESTAURANT_WHATSAPP || '+351920617185';

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

// POST /api/stripe/create-payment-intent
app.post('/api/stripe/create-payment-intent', express.json(), async (req, res) => {
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
    
    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: process.env.STRIPE_CURRENCY || 'eur',
      metadata: {
        orderId: order.id.toString(),
        orderNumber: order.orderNumber,
        customerEmail: customerInfo.email,
      },
      description: `Order ${order.orderNumber} - Namaste Curry House`,
      receipt_email: customerInfo.email,
    });
    
    // Update order with payment intent ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });
    
    console.log(`✅ Payment intent created for order ${order.orderNumber}`);
    
    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: total,
    });
    
  } catch (error) {
    console.error('❌ Error creating payment intent:', error);
    console.error('Error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    });
    
    res.status(500).json({ 
      error: 'Failed to create payment intent',
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
      
      // Send WhatsApp notification to restaurant
      logWhatsAppNotification(order);
      
      // TODO: Send confirmation email to customer
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