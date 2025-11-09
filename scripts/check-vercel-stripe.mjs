/**
 * Check Stripe configuration on Vercel deployment
 */

const VERCEL_URL = 'https://namastecurryhouse.vercel.app';

async function checkStripeHealth() {
  console.log('🔍 Checking Stripe configuration on Vercel...\n');
  console.log(`Target: ${VERCEL_URL}/api/stripe/health\n`);
  
  try {
    const response = await fetch(`${VERCEL_URL}/api/stripe/health`);
    
    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error('Response:', text);
      return;
    }
    
    const data = await response.json();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`Stripe Initialized: ${data.stripeInitialized ? '✅' : '❌'}\n`);
    
    console.log('Environment Variables:');
    for (const [key, value] of Object.entries(data.environment)) {
      const status = value.includes('NOT SET') ? '❌' : '✅';
      console.log(`  ${status} ${key}: ${value}`);
    }
    console.log('');
    
    console.log('Mode Detection:');
    console.log(`  Secret Key: ${data.secretKeyIsTestMode ? 'TEST ✅' : 'LIVE ⚠️'}`);
    console.log(`  Publishable Key: ${data.publishableKeyIsTestMode ? 'TEST ✅' : 'LIVE ⚠️'}`);
    console.log('');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (!data.stripeInitialized) {
      console.error('❌ PROBLEM: Stripe is not initialized on Vercel!\n');
      console.log('To fix this:');
      console.log('  1. Go to: https://vercel.com/dashboard');
      console.log('  2. Select your project: namastecurryhouse');
      console.log('  3. Go to Settings → Environment Variables');
      console.log('  4. Add/verify these variables for Production:');
      console.log('     - STRIPE_SECRET_KEY');
      console.log('     - STRIPE_PUBLISHABLE_KEY');
      console.log('     - VITE_STRIPE_PUBLISHABLE_KEY');
      console.log('     - STRIPE_WEBHOOK_SECRET');
      console.log('     - STRIPE_CURRENCY=eur');
      console.log('  5. Redeploy the application\n');
    } else {
      console.log('✅ Stripe is properly configured!\n');
    }
    
  } catch (error) {
    console.error('❌ Error checking Stripe health:', error.message);
  }
}

async function checkStripeConfig() {
  console.log('\n🔍 Checking Stripe config endpoint...\n');
  
  try {
    const response = await fetch(`${VERCEL_URL}/api/stripe/config`);
    
    if (!response.ok) {
      console.error(`❌ Config endpoint error: ${response.status} ${response.statusText}`);
      const data = await response.json();
      console.error('Response:', data);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Config endpoint working');
    console.log(`   Publishable Key: ${data.publishableKey?.substring(0, 20)}...`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Error checking config:', error.message);
  }
}

// Run checks
console.log('═══════════════════════════════════════════');
console.log('  VERCEL STRIPE CONFIGURATION CHECK');
console.log('═══════════════════════════════════════════\n');

await checkStripeHealth();
await checkStripeConfig();

console.log('Check complete! ✨\n');
