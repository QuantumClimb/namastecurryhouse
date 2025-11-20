// Vercel serverless function for Stripe webhook
import Stripe from 'stripe';
import pkg from '@prisma/client';
import { Resend } from 'resend';

const { PrismaClient } = pkg;

// Lazy initialization to avoid top-level crashes
let prisma = null;
let stripe = null;
let resend = null;

function initializeServices() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured');
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not configured');
  }
  
  if (!prisma) prisma = new PrismaClient();
  if (!stripe) stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  
  return { prisma, stripe, resend };
}

// Restaurant contact info
const RESTAURANT_WHATSAPP = process.env.RESTAURANT_WHATSAPP || '+351920617185';
const RESTAURANT_EMAIL = process.env.RESTAURANT_EMAIL || 'namastecurrylisboa@gmail.com';
const TEST_MODE = process.env.TEST_MODE === 'true';
const TEST_MODE_EMAIL = process.env.TEST_MODE_EMAIL || 'juncando@gmail.com';
const TEST_MODE_OWNER_EMAIL = process.env.TEST_MODE_OWNER_EMAIL || 'namastecurrylisboa@gmail.com';

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
async function sendCustomerConfirmationEmail(order, resend) {
  try {
    console.log('📧 Preparing customer confirmation email...');
    
    const orderItemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          ${item.name}
          ${item.customization?.spiceLevel ? `<br><small style="color: #6b7280;">Spice Level: ${item.customization.spiceLevel}</small>` : ''}
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
          ${TEST_MODE ? `
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 0 0 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #92400e;">⚠️ TEST MODE</p>
            <p style="margin: 5px 0 0; color: #92400e; font-size: 13px;">This email was sent to ${TEST_MODE_EMAIL} for testing. Original recipient: ${order.email}</p>
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

    const recipientEmail = TEST_MODE ? TEST_MODE_EMAIL : order.email;
    console.log(`📤 Sending customer email to: ${recipientEmail} (TEST_MODE: ${TEST_MODE})`);

    const { data, error } = await resend.emails.send({
      from: 'Namaste Curry <orders@namastecurry.house>',
      to: recipientEmail,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: htmlContent,
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

async function sendOwnerNotificationEmail(order, resend) {
  try {
    console.log('📧 Preparing owner notification email...');
    
    const orderItemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          ${item.name}
          ${item.customization?.spiceLevel ? `<br><small style="color: #6b7280;">Spice Level: ${item.customization.spiceLevel}</small>` : ''}
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
        <div style="background-color: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🔔 New Order Received!</h1>
          <p style="margin: 10px 0 0; font-size: 18px; font-weight: bold;">Order ${order.orderNumber}</p>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          ${TEST_MODE ? `
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 0 0 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #92400e;">⚠️ TEST MODE</p>
            <p style="margin: 5px 0 0; color: #92400e; font-size: 13px;">This email was sent to ${TEST_MODE_OWNER_EMAIL} for testing.</p>
          </div>
          ` : ''}
          
          <div style="background-color: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 0 0 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #991b1b;">⚡ ACTION REQUIRED</p>
            <p style="margin: 5px 0 0; color: #991b1b;">New paid order received. Please prepare for delivery!</p>
          </div>

          <h2 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">Customer Information</h2>
          <table style="width: 100%; margin: 15px 0;">
            <tr>
              <td style="padding: 8px; font-weight: bold; width: 30%;">Name:</td>
              <td style="padding: 8px;">${order.customerName}</td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td style="padding: 8px; font-weight: bold;">Phone:</td>
              <td style="padding: 8px;"><a href="tel:${order.phone}" style="color: #D4AF37;">${order.phone}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px; font-weight: bold;">Email:</td>
              <td style="padding: 8px;"><a href="mailto:${order.email}" style="color: #D4AF37;">${order.email}</a></td>
            </tr>
          </table>

          <h2 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px; margin-top: 30px;">Order Items</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ef4444;">Item</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ef4444;">Qty</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ef4444;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold; border-top: 2px solid #ef4444;">Subtotal:</td>
                <td style="padding: 12px; text-align: right; border-top: 2px solid #ef4444;">€${order.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold;">Delivery Fee:</td>
                <td style="padding: 12px; text-align: right;">€${order.deliveryFee.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px; color: #ef4444;">Total:</td>
                <td style="padding: 12px; text-align: right; font-size: 18px; font-weight: bold; color: #ef4444;">€${order.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <h2 style="color: #ef4444; border-bottom: 2px solid #ef4444; padding-bottom: 10px; margin-top: 30px;">Delivery Details</h2>
          <table style="width: 100%; margin: 15px 0;">
            <tr>
              <td style="padding: 8px; font-weight: bold; width: 30%;">Delivery Method:</td>
              <td style="padding: 8px;">${order.deliveryMethod === 'pickup' ? '🏃 Customer Pickup' : '🚗 Delivery'}</td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td style="padding: 8px; font-weight: bold;">Address:</td>
              <td style="padding: 8px;">${addressHtml}</td>
            </tr>
            ${order.deliveryInstructions ? `
            <tr>
              <td style="padding: 8px; font-weight: bold; vertical-align: top;">Instructions:</td>
              <td style="padding: 8px;">${order.deliveryInstructions}</td>
            </tr>
            ` : ''}
            <tr style="background-color: #f9fafb;">
              <td style="padding: 8px; font-weight: bold;">Payment:</td>
              <td style="padding: 8px;">💳 Paid via Stripe</td>
            </tr>
          </table>

          <div style="background-color: #dcfce7; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #166534;"><strong>✓ Payment Confirmed</strong><br>
            This order has been paid in full via Stripe.</p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <div style="text-align: center; color: #6b7280; font-size: 14px;">
            <p>Order received at ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/Lisbon' })} (Lisbon time)</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const recipientEmail = TEST_MODE ? TEST_MODE_OWNER_EMAIL : RESTAURANT_EMAIL;
    console.log(`📤 Sending owner email to: ${recipientEmail} (TEST_MODE: ${TEST_MODE})`);

    const { data, error } = await resend.emails.send({
      from: 'Namaste Curry <orders@namastecurry.house>',
      to: recipientEmail,
      subject: `New Order - ${order.orderNumber}`,
      html: htmlContent,
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
async function handleCheckoutSessionCompleted(session, services) {
  const { prisma, resend } = services;
  
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

    console.log('🔍 Looking up order with stripeSessionId:', session.id);
    const order = await prisma.order.findUnique({
      where: { stripeSessionId: session.id }
    });

    if (!order) {
      console.error('❌ No order found with stripeSessionId:', session.id);
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
        stripePaymentIntentId: session.payment_intent
      }
    });
    console.log('✅ Order status updated to CONFIRMED');

    // Parse JSON fields for email sending
    const orderWithItems = {
      ...updatedOrder,
      items: typeof updatedOrder.orderItems === 'string' ? JSON.parse(updatedOrder.orderItems) : updatedOrder.orderItems,
      deliveryAddress: typeof updatedOrder.deliveryAddress === 'string' ? JSON.parse(updatedOrder.deliveryAddress) : updatedOrder.deliveryAddress
    };

    // Send confirmation emails
    console.log('📧 Starting email sending process...');
    try {
      await sendCustomerConfirmationEmail(orderWithItems, resend);
      await sendOwnerNotificationEmail(orderWithItems, resend);
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
  console.log('🎯 [SERVERLESS WEBHOOK] Request received at:', new Date().toISOString());
  console.log('📍 Method:', req.method);
  console.log('📍 URL:', req.url);
  console.log('📍 Headers:', Object.keys(req.headers).join(', '));
  
  // Initialize services with error handling
  let services;
  try {
    console.log('🔧 Initializing services...');
    services = initializeServices();
    console.log('✅ Services initialized successfully');
  } catch (error) {
    console.error('❌ CRITICAL: Failed to initialize services:', error.message);
    console.error('   This means the serverless function could not start');
    console.error('   Check Vercel environment variables for:', error.message);
    return res.status(500).json({ 
      error: 'Service initialization failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
  
  if (req.method !== 'POST') {
    console.log('⚠️ Non-POST request rejected');
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
    console.log('🔍 Verifying webhook signature with STRIPE_WEBHOOK_SECRET...');
    event = services.stripe.webhooks.constructEvent(
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
    
    if (event.type === 'checkout.session.completed') {
      console.log('💳 Processing checkout.session.completed event');
      await handleCheckoutSessionCompleted(event.data.object, services);
      console.log('✅ Checkout session processed successfully');
    } else {
      console.log('ℹ️ Unhandled event type:', event.type);
    }
    
    console.log('✅ [SERVERLESS WEBHOOK] Processing complete');
    res.status(200).json({ received: true, source: 'serverless-webhook' });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Webhook processing failed', details: error.message });
  }
}
