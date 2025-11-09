/**
 * Stripe Configuration Verification Script
 * 
 * This script checks if Stripe environment variables are properly configured
 * without exposing sensitive keys. Safe to commit to git.
 */

import { config } from 'dotenv';
config();

console.log('\n🔍 Stripe Configuration Check\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const checks = [
  {
    name: 'STRIPE_SECRET_KEY',
    value: process.env.STRIPE_SECRET_KEY,
    expectedPrefix: 'sk_',
    type: 'Backend'
  },
  {
    name: 'STRIPE_PUBLISHABLE_KEY',
    value: process.env.STRIPE_PUBLISHABLE_KEY,
    expectedPrefix: 'pk_',
    type: 'Backend'
  },
  {
    name: 'VITE_STRIPE_PUBLISHABLE_KEY',
    value: process.env.VITE_STRIPE_PUBLISHABLE_KEY,
    expectedPrefix: 'pk_',
    type: 'Frontend'
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    value: process.env.STRIPE_WEBHOOK_SECRET,
    expectedPrefix: 'whsec_',
    type: 'Webhook'
  },
  {
    name: 'STRIPE_CURRENCY',
    value: process.env.STRIPE_CURRENCY,
    expectedValue: 'eur',
    type: 'Config'
  }
];

let allPassed = true;

checks.forEach(check => {
  const isSet = !!check.value;
  const hasCorrectPrefix = check.expectedPrefix 
    ? check.value?.startsWith(check.expectedPrefix)
    : true;
  const hasCorrectValue = check.expectedValue
    ? check.value?.toLowerCase() === check.expectedValue
    : true;
  
  const status = isSet && hasCorrectPrefix && hasCorrectValue ? '✅' : '❌';
  
  if (!isSet || !hasCorrectPrefix || !hasCorrectValue) {
    allPassed = false;
  }

  console.log(`${status} ${check.name} (${check.type})`);
  
  if (isSet) {
    const preview = check.value.substring(0, 20) + '...';
    console.log(`   ${preview}`);
    
    if (check.expectedPrefix && !hasCorrectPrefix) {
      console.log(`   ⚠️  Expected to start with: ${check.expectedPrefix}`);
    }
    
    if (check.expectedValue && !hasCorrectValue) {
      console.log(`   ⚠️  Expected value: ${check.expectedValue}`);
    }
    
    // Check for test vs live mode
    if (check.name.includes('KEY')) {
      const isTestMode = check.value.includes('_test_');
      const mode = isTestMode ? 'TEST (Sandbox)' : 'LIVE (Production)';
      console.log(`   🔧 Mode: ${mode}`);
    }
  } else {
    console.log(`   ⚠️  Not set`);
  }
  console.log('');
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (allPassed) {
  console.log('✅ All Stripe configuration checks passed!\n');
  console.log('Next steps:');
  console.log('  1. Ensure these variables are set in Vercel dashboard');
  console.log('  2. Test payment flow at: https://namastecurry.house');
  console.log('  3. Monitor webhook events in Stripe dashboard\n');
  process.exit(0);
} else {
  console.log('❌ Some configuration checks failed.\n');
  console.log('Please verify:');
  console.log('  1. All required environment variables are set in .env');
  console.log('  2. Keys have the correct prefixes (sk_/pk_/whsec_)');
  console.log('  3. Using test keys for development, live keys for production\n');
  process.exit(1);
}
