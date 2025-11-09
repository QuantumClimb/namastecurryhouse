// Script to verify Stripe payment status for pending orders
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function verifyStripePayments() {
  console.log('🔍 Verifying Stripe payment status for pending orders...\n');
  
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
    process.exit(1);
  }
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia',
  });
  
  try {
    // Find pending orders with Stripe session IDs
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        paymentStatus: 'PENDING',
        stripeSessionId: {
          not: null
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (pendingOrders.length === 0) {
      console.log('✅ No pending orders with Stripe sessions found.\n');
      return;
    }
    
    console.log(`Found ${pendingOrders.length} pending order(s). Checking Stripe...\n`);
    
    const results = [];
    
    for (const order of pendingOrders) {
      console.log(`📋 Order: ${order.orderNumber}`);
      console.log(`   Session ID: ${order.stripeSessionId}`);
      
      try {
        // Retrieve the checkout session from Stripe
        const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
        
        console.log(`   Payment Status: ${session.payment_status}`);
        console.log(`   Status: ${session.status}`);
        
        if (session.payment_intent) {
          console.log(`   Payment Intent: ${session.payment_intent}`);
        }
        
        results.push({
          order,
          session,
          shouldConfirm: session.payment_status === 'paid' && session.status === 'complete'
        });
        
        if (session.payment_status === 'paid') {
          console.log(`   ✅ PAYMENT SUCCEEDED - Order should be confirmed`);
        } else {
          console.log(`   ⚠️  Payment not completed (${session.payment_status})`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error checking Stripe: ${error.message}`);
        results.push({
          order,
          session: null,
          error: error.message,
          shouldConfirm: false
        });
      }
      
      console.log('');
    }
    
    // Summary
    const toConfirm = results.filter(r => r.shouldConfirm);
    
    if (toConfirm.length > 0) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`\n✅ Found ${toConfirm.length} order(s) that were PAID but not confirmed:\n`);
      
      toConfirm.forEach(({ order, session }) => {
        console.log(`   • ${order.orderNumber} - €${order.total.toFixed(2)}`);
        console.log(`     Customer: ${order.customerEmail}`);
        console.log(`     Paid: ${new Date(session.created * 1000).toLocaleString()}`);
      });
      
      console.log('\n💡 To confirm these orders and send emails, run:');
      console.log('   node update-pending-orders.mjs --confirm\n');
      console.log('   Then send emails:');
      toConfirm.forEach(({ order }) => {
        console.log(`   node test-order-emails.mjs ${order.id}`);
      });
    } else {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\nℹ️  No paid orders need confirmation.');
      console.log('   Either payments haven\'t completed or orders are already confirmed.\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyStripePayments();
