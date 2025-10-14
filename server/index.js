// server/index.js - Express API server for menu data
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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
        spiceLevel: item.spiceLevel
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
      spiceLevel: item.spiceLevel
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
      category: item.category.name
    }));

    res.json(searchResults);
  } catch (error) {
    console.error('Error searching menu:', error);
    res.status(500).json({ error: 'Failed to search menu' });
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