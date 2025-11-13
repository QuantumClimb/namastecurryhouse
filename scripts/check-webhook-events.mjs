import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function checkWebhookEvents() {
  console.log('🔍 Checking recent webhook delivery attempts...\n');
  
  try {
    // Get recent events to see webhook delivery status
    const events = await stripe.events.list({ 
      limit: 20,
      types: ['checkout.session.completed', 'payment_intent.succeeded']
    });
    
    console.log(`📊 Found ${events.data.length} recent payment events:\n`);
    
    for (const event of events.data) {
      console.log(`Event: ${event.type}`);
      console.log(`  ID: ${event.id}`);
      console.log(`  Created: ${new Date(event.created * 1000).toLocaleString()}`);
      
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log(`  Session ID: ${session.id}`);
        console.log(`  Payment Status: ${session.payment_status}`);
        console.log(`  Amount: €${(session.amount_total / 100).toFixed(2)}`);
      }
      
      if (event.type === 'payment_intent.succeeded') {
        const intent = event.data.object;
        console.log(`  Payment Intent ID: ${intent.id}`);
        console.log(`  Amount: €${(intent.amount / 100).toFixed(2)}`);
      }
      
      console.log('');
    }
    
    console.log('\n⚠️  Important: Webhook delivery failures are visible in Stripe Dashboard');
    console.log('Go to: https://dashboard.stripe.com/test/webhooks/we_1SQshX4AYllAtAxreGYjEA8w');
    console.log('Check the "Events sent to endpoint" section for delivery failures\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

await checkWebhookEvents();
