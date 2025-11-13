import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function checkWebhookConfig() {
  console.log('🔍 Checking Stripe webhook configuration...\n');
  
  try {
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    
    if (webhooks.data.length === 0) {
      console.log('❌ NO WEBHOOKS CONFIGURED!');
      console.log('This explains why orders are stuck at PENDING.');
      console.log('\nYou need to:');
      console.log('1. Go to Stripe Dashboard → Developers → Webhooks');
      console.log('2. Add endpoint: https://namastecurryhouse.vercel.app/api/stripe/webhook');
      console.log('3. Select events: checkout.session.completed, payment_intent.succeeded');
      return;
    }
    
    console.log(`📊 Found ${webhooks.data.length} webhook(s):\n`);
    
    webhooks.data.forEach((wh, index) => {
      console.log(`${index + 1}. Webhook ID: ${wh.id}`);
      console.log(`   URL: ${wh.url}`);
      console.log(`   Status: ${wh.status}`);
      console.log(`   Events: ${wh.enabled_events.join(', ')}`);
      console.log(`   Created: ${new Date(wh.created * 1000).toLocaleString()}`);
      console.log(`   Secret: ${wh.secret ? wh.secret.substring(0, 20) + '...' : 'N/A'}`);
      
      if (wh.url.includes('namastecurryhouse.vercel.app')) {
        console.log('   ✅ This is your production webhook');
      }
      
      console.log('');
    });
    
    // Check for the correct URL
    const correctWebhook = webhooks.data.find(wh => 
      wh.url.includes('namastecurryhouse.vercel.app/api/stripe/webhook')
    );
    
    if (!correctWebhook) {
      console.log('⚠️  No webhook found for: https://namastecurryhouse.vercel.app/api/stripe/webhook');
      console.log('The webhook might be pointing to a different URL.');
    } else {
      console.log('✅ Production webhook is configured correctly');
      
      if (!correctWebhook.enabled_events.includes('checkout.session.completed')) {
        console.log('⚠️  Missing event: checkout.session.completed');
      }
      
      if (correctWebhook.status !== 'enabled') {
        console.log(`⚠️  Webhook status is: ${correctWebhook.status} (should be enabled)`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking webhooks:', error.message);
  }
}

checkWebhookConfig();
