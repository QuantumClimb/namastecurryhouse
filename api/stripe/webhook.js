// Vercel serverless function for Stripe webhook
import Stripe from 'stripe';
import pkg from '@prisma/client';
import { Resend } from 'resend';
import { renderToString } from 'react-dom/server';
import CustomerConfirmationEmail from '../../src/emails/CustomerConfirmationEmail.jsx';
import OwnerNotificationEmail from '../../src/emails/OwnerNotificationEmail.jsx';
import dotenv from 'dotenv';

dotenv.config();

const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// IMPORTANT: Disable body parsing so we can get the raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to read raw body
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Email sending function
async function sendCustomerConfirmationEmail(order) {
  try {
    console.log('📧 Preparing customer confirmation email...');
    
    const emailContent = CustomerConfirmationEmail({
      orderId: order.orderNumber,
      customerName: order.customerName,
      items: order.items,
      total: order.total,
      deliveryAddress: order.deliveryAddress,
      deliveryTime: order.deliveryTime,
    });

    const emailHtml = renderToString(emailContent);
    const recipientEmail = process.env.TEST_MODE === 'true' 
      ? process.env.TEST_MODE_EMAIL 
      : order.email;
    
    console.log(`📤 Sending customer email to: ${recipientEmail} (TEST_MODE: ${process.env.TEST_MODE})`);

    const { data, error } = await resend.emails.send({
      from: 'Namaste Curry <orders@namastecurry.house>',
      to: recipientEmail,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: emailHtml,
    });

    if (error) {
      console.error('❌ Customer email error:', error);
      throw error;
    }

    console.log('✅ Customer email sent successfully. Email ID:', data?.id);
    return data;
  } catch (error) {
    console.error('❌ Failed to send customer email:', error);
    throw error;
  }
}

async function sendOwnerNotificationEmail(order) {
  try {
    console.log('📧 Preparing owner notification email...');
    
    const emailContent = OwnerNotificationEmail({
      orderId: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.email,
      customerPhone: order.phone,
      items: order.items,
      total: order.total,
      deliveryAddress: order.deliveryAddress,
      deliveryTime: order.deliveryTime,
      deliveryMethod: order.deliveryMethod || 'delivery',
      paymentMethod: 'card',
    });

    const emailHtml = renderToString(emailContent);
    const recipientEmail = process.env.TEST_MODE === 'true' 
      ? process.env.TEST_MODE_OWNER_EMAIL 
      : process.env.OWNER_EMAIL;
    
    console.log(`📤 Sending owner email to: ${recipientEmail} (TEST_MODE: ${process.env.TEST_MODE})`);

    const { data, error } = await resend.emails.send({
      from: 'Namaste Curry <orders@namastecurry.house>',
      to: recipientEmail,
      subject: `New Order - ${order.orderNumber}`,
      html: emailHtml,
    });

    if (error) {
      console.error('❌ Owner email error:', error);
      throw error;
    }

    console.log('✅ Owner email sent successfully. Email ID:', data?.id);
    return data;
  } catch (error) {
    console.error('❌ Failed to send owner email:', error);
    throw error;
  }
}

// Handle checkout session completed
async function handleCheckoutSessionCompleted(session) {
  try {
    console.log('🔍 Processing checkout session:', session.id);
    console.log('💰 Payment status:', session.payment_status);
    console.log('📧 Customer email:', session.customer_details?.email);

    if (session.payment_status !== 'paid') {
      console.log('⚠️ Payment not completed yet, skipping...');
      return;
    }

    console.log('🔗 Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connected');

    console.log('🔍 Looking up order with sessionId:', session.id);
    const order = await prisma.order.findUnique({
      where: { sessionId: session.id },
      include: { items: true }
    });

    if (!order) {
      console.error('❌ No order found with sessionId:', session.id);
      throw new Error('Order not found');
    }

    console.log('✅ Order found:', order.orderNumber, 'Current status:', order.status);

    if (order.status === 'CONFIRMED') {
      console.log('ℹ️ Order already confirmed, skipping...');
      return;
    }

    console.log('📝 Updating order status to CONFIRMED...');
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { 
        status: 'CONFIRMED',
        paymentIntentId: session.payment_intent
      },
      include: { items: true }
    });
    console.log('✅ Order status updated to CONFIRMED');

    // Send confirmation emails
    console.log('📧 Starting email sending process...');
    try {
      await sendCustomerConfirmationEmail(updatedOrder);
      await sendOwnerNotificationEmail(updatedOrder);
      console.log('✅ Both emails sent successfully');
    } catch (emailError) {
      console.error('❌ Email sending failed (but order is confirmed):', emailError);
      // Don't throw - order is already confirmed
    }

  } catch (error) {
    console.error('❌ Error handling checkout session:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  } finally {
    console.log('🔌 Disconnecting from database...');
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
  }
}

// Main handler
export default async function handler(req, res) {
  console.log('🎯 Webhook received at:', new Date().toISOString());
  console.log('📍 Method:', req.method);
  console.log('📍 URL:', req.url);
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  console.log('🔑 Signature present:', !!sig);
  
  if (!sig) {
    console.error('❌ No stripe-signature header found');
    return res.status(400).json({ error: 'No signature provided' });
  }

  let event;
  
  try {
    // Get raw body for signature verification
    console.log('📖 Reading raw body...');
    const rawBody = await getRawBody(req);
    console.log('✅ Raw body received, length:', rawBody.length);
    
    // Verify webhook signature
    console.log('🔍 Verifying webhook signature...');
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('✅ Signature verified. Event type:', event.type, 'Event ID:', event.id);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    console.error('Error details:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    console.log('🎯 Handling event type:', event.type);
    
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('💳 Processing checkout.session.completed event');
        await handleCheckoutSessionCompleted(event.data.object);
        console.log('✅ Checkout session processed successfully');
        break;
      
      default:
        console.log('ℹ️ Unhandled event type:', event.type);
    }
    
    console.log('✅ Webhook processed successfully');
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Webhook processing failed', details: error.message });
  }
}
