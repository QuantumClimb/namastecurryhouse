import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function checkWebhookSecret() {
  console.log('🔍 Checking webhook configuration and secrets...\n');
  
  try {
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    
    console.log(`📊 Found ${webhooks.data.length} webhook(s):\n`);
    
    for (const [index, wh] of webhooks.data.entries()) {
      console.log(`${index + 1}. Webhook ID: ${wh.id}`);
      console.log(`   URL: ${wh.url}`);
      console.log(`   Status: ${wh.status}`);
      console.log(`   Created: ${new Date(wh.created * 1000).toLocaleString()}`);
      
      // Check if this webhook includes the required events
      const hasCheckoutCompleted = wh.enabled_events.includes('checkout.session.completed');
      const hasPaymentSucceeded = wh.enabled_events.includes('payment_intent.succeeded');
      
      console.log(`   Has checkout.session.completed: ${hasCheckoutCompleted ? '✅' : '❌'}`);
      console.log(`   Has payment_intent.succeeded: ${hasPaymentSucceeded ? '✅' : '❌'}`);
      
      // Note: We can't retrieve the actual secret from Stripe API for security reasons
      // But we can see when it was last updated
      console.log(`\n   ⚠️  Note: Webhook secrets cannot be retrieved from Stripe API`);
      console.log(`   Your .env has: ${process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 15)}...`);
      console.log(`   Make sure this matches the secret shown in Stripe Dashboard for this webhook\n`);
    }
    
    // Check which URLs are configured
    const vercelWebhook = webhooks.data.find(wh => 
      wh.url.includes('namastecurryhouse.vercel.app')
    );
    
    const customDomainWebhook = webhooks.data.find(wh => 
      wh.url.includes('namastecurry.house')
    );
    
    console.log('\n📍 Webhook URLs Analysis:');
    if (vercelWebhook) {
      console.log(`✅ Vercel webhook found: ${vercelWebhook.url} (status: ${vercelWebhook.status})`);
    } else {
      console.log('❌ No webhook for namastecurryhouse.vercel.app');
    }
    
    if (customDomainWebhook) {
      console.log(`✅ Custom domain webhook found: ${customDomainWebhook.url} (status: ${customDomainWebhook.status})`);
    } else {
      console.log('❌ No webhook for namastecurry.house');
    }
    
    console.log('\n🔑 Your current configuration:');
    console.log(`   VITE_API_URL: ${process.env.VITE_API_URL}`);
    console.log(`   STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY?.substring(0, 20)}...`);
    console.log(`   STRIPE_WEBHOOK_SECRET: ${process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 15)}...`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

await checkWebhookSecret();
