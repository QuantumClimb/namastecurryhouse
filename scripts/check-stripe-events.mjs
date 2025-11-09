import Stripe from 'stripe';
import { config } from 'dotenv';

config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

console.log('🔔 Checking Stripe Webhook Events...\n');
console.log('═══════════════════════════════════════════\n');

try {
  // Get recent events
  const events = await stripe.events.list({
    limit: 20,
    types: ['payment_intent.succeeded', 'payment_intent.payment_failed', 'charge.succeeded']
  });

  if (events.data.length === 0) {
    console.log('No payment events found.\n');
    console.log('This could mean:');
    console.log('  1. No payments have been completed yet');
    console.log('  2. Only payment intents were created but not confirmed\n');
  } else {
    console.log(`Found ${events.data.length} payment event(s):\n`);
    
    events.data.forEach((event, index) => {
      const date = new Date(event.created * 1000).toLocaleString();
      const data = event.data.object;
      
      console.log(`${index + 1}. ${event.type}`);
      console.log(`   Event ID: ${event.id}`);
      console.log(`   Date: ${date}`);
      
      if (data.id) {
        console.log(`   Payment Intent: ${data.id}`);
      }
      
      if (data.amount) {
        console.log(`   Amount: €${(data.amount / 100).toFixed(2)}`);
      }
      
      if (data.status) {
        console.log(`   Status: ${data.status}`);
      }
      
      if (data.metadata && data.metadata.orderNumber) {
        console.log(`   Order Number: ${data.metadata.orderNumber}`);
      }
      
      if (data.receipt_email) {
        console.log(`   Email: ${data.receipt_email}`);
      }
      
      console.log('');
    });
  }
  
  // Check webhook endpoints
  console.log('═══════════════════════════════════════════');
  console.log('Checking Webhook Endpoints...\n');
  
  const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
  
  if (webhooks.data.length === 0) {
    console.log('❌ No webhook endpoints configured!\n');
    console.log('You need to set up a webhook at:');
    console.log('https://dashboard.stripe.com/test/webhooks\n');
  } else {
    webhooks.data.forEach((webhook, index) => {
      console.log(`${index + 1}. ${webhook.url}`);
      console.log(`   Status: ${webhook.status}`);
      console.log(`   Secret: ${webhook.secret.substring(0, 15)}...`);
      console.log(`   Listening for: ${webhook.enabled_events.length} event types`);
      console.log('');
    });
  }
  
  console.log('═══════════════════════════════════════════\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
}
