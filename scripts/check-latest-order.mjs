// Quick script to check the latest order and test emails
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

async function checkLatestOrder() {
  console.log('🔍 Fetching latest orders...\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/orders`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
    }
    
    const orders = await response.json();
    
    if (orders.length === 0) {
      console.log('❌ No orders found in database');
      return;
    }
    
    // Sort by creation date (most recent first)
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const latestOrder = orders[0];
    
    console.log('📋 Latest Order Details:');
    console.log('─────────────────────────────────────');
    console.log(`Order ID:         ${latestOrder.id}`);
    console.log(`Order Number:     ${latestOrder.orderNumber}`);
    console.log(`Customer:         ${latestOrder.customerName}`);
    console.log(`Email:            ${latestOrder.customerEmail}`);
    console.log(`Phone:            ${latestOrder.customerPhone}`);
    console.log(`Status:           ${latestOrder.status}`);
    console.log(`Payment Status:   ${latestOrder.paymentStatus}`);
    console.log(`Payment Method:   ${latestOrder.paymentMethod}`);
    console.log(`Total:            €${latestOrder.total.toFixed(2)}`);
    console.log(`Created:          ${new Date(latestOrder.createdAt).toLocaleString()}`);
    if (latestOrder.confirmedAt) {
      console.log(`Confirmed:        ${new Date(latestOrder.confirmedAt).toLocaleString()}`);
    }
    console.log('\n💡 To test email sending for this order, run:');
    console.log(`   node test-order-emails.mjs ${latestOrder.id}`);
    console.log('\n📊 Recent Orders Summary:');
    console.log(`   Total orders: ${orders.length}`);
    console.log(`   Last 5 orders:`);
    
    orders.slice(0, 5).forEach((order, idx) => {
      console.log(`   ${idx + 1}. ${order.orderNumber} - ${order.customerName} - €${order.total.toFixed(2)} - ${order.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkLatestOrder();
