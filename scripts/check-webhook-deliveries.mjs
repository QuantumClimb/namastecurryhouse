import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function checkWebhookDeliveries() {
  console.log('🔍 Checking webhook delivery attempts...\n');
  
  try {
    // Get the webhook endpoint
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    const webhook = webhooks.data.find(wh => wh.url.includes('namastecurry.house'));
    
    if (!webhook) {
      console.log('❌ No webhook found for namastecurry.house');
      return;
    }
    
    console.log(`📍 Webhook: ${webhook.url}`);
    console.log(`   Status: ${webhook.status}`);
    console.log(`   ID: ${webhook.id}\n`);
    
    // Get recent events for the checkout sessions we know about
    const recentSessions = [
      'cs_test_b1EfzgSkZytGdxqgR9PtqOGVBlGGRcPrUE3LZXbZFFCXAwHV69IqRMJzlm', // Order 24
      'cs_test_b1BL5dBif4qR2j56fXfZxFuW7hJD8Piv8U2XM29VrTPzP0mSkpFaD7LRZ1'  // Order 23
    ];
    
    console.log('📊 Checking events for pending orders:\n');
    
    for (const sessionId of recentSessions) {
      console.log(`Session: ${sessionId}`);
      
      // Search for events related to this session
      const events = await stripe.events.list({ 
        limit: 10,
        types: ['checkout.session.completed']
      });
      
      const sessionEvent = events.data.find(evt => 
        evt.data.object.id === sessionId
      );
      
      if (sessionEvent) {
        console.log(`  ✅ Event found: ${sessionEvent.id}`);
        console.log(`  Created: ${new Date(sessionEvent.created * 1000).toLocaleString()}`);
        console.log(`  Type: ${sessionEvent.type}`);
        
        // Note: We cannot get webhook delivery attempts via API
        // They must be checked in Stripe Dashboard
        console.log(`  ⚠️  Webhook delivery status must be checked in dashboard:`);
        console.log(`     https://dashboard.stripe.com/test/events/${sessionEvent.id}\n`);
      } else {
        console.log(`  ❌ No event found for this session\n`);
      }
    }
    
    console.log('\n💡 To see webhook delivery failures:');
    console.log(`   1. Go to: https://dashboard.stripe.com/test/webhooks/${webhook.id}`);
    console.log(`   2. Click on "Events sent to endpoint"`);
    console.log(`   3. Look for the checkout.session.completed events from Nov 13`);
    console.log(`   4. Check if they show "Succeeded" or "Failed"`);
    console.log(`\n   If they failed, you'll see the exact error message (e.g., timeout, 500 error, signature mismatch)`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

await checkWebhookDeliveries();
