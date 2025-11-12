#!/usr/bin/env node

/**
 * Monitor Domain Verification Status
 * Checks every 30 seconds until verified
 */

import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const DOMAIN_ID = 'ae58493f-bc33-43bf-a8f0-abce4ef2df79';
const CHECK_INTERVAL = 30000; // 30 seconds
let checkCount = 0;
const MAX_CHECKS = 20; // Stop after 10 minutes

console.log('👀 Monitoring domain verification status...');
console.log('⏰ Checking every 30 seconds\n');

async function checkStatus() {
  checkCount++;
  const timestamp = new Date().toLocaleTimeString();
  
  try {
    const result = await resend.domains.get(DOMAIN_ID);
    const status = result.data.status;
    
    console.log(`[${timestamp}] Check #${checkCount}: ${status.toUpperCase()}`);
    
    if (status === 'verified') {
      console.log('\n' + '═'.repeat(60));
      console.log('🎉 SUCCESS! DOMAIN VERIFIED!');
      console.log('═'.repeat(60));
      console.log('\n✅ Your domain namastecurry.house is now verified!');
      console.log('\n📧 Email Capabilities:');
      console.log('   • Send from: orders@namastecurry.house');
      console.log('   • Send from: info@namastecurry.house');
      console.log('   • Send from: noreply@namastecurry.house');
      console.log('   • Any email @namastecurry.house');
      
      console.log('\n📝 Next Steps:');
      console.log('1. Update server/index.js sender emails:');
      console.log('   from: "Namaste Curry House <orders@namastecurry.house>"');
      console.log('\n2. Update Vercel environment variables:');
      console.log('   RESEND_TEST_MODE=false');
      console.log('\n3. Redeploy application');
      console.log('\n4. Test with a real order');
      
      console.log('\n🔗 View domain settings: https://resend.com/domains/' + DOMAIN_ID);
      process.exit(0);
    } else if (status === 'failed') {
      console.log('\n❌ Verification failed');
      console.log('Check DNS records at: https://resend.com/domains/' + DOMAIN_ID);
      process.exit(1);
    } else if (status === 'pending') {
      // Show record details
      if (result.data.records) {
        const verifiedCount = result.data.records.filter(r => r.status === 'verified').length;
        const totalCount = result.data.records.length;
        console.log(`   Records: ${verifiedCount}/${totalCount} verified`);
      }
    }
    
    if (checkCount >= MAX_CHECKS) {
      console.log('\n⏰ Timeout: Verification taking longer than expected');
      console.log('Check manually at: https://resend.com/domains/' + DOMAIN_ID);
      process.exit(1);
    }
    
    // Schedule next check
    setTimeout(checkStatus, CHECK_INTERVAL);
    
  } catch (error) {
    console.error(`[${timestamp}] Error:`, error.message);
    setTimeout(checkStatus, CHECK_INTERVAL);
  }
}

// Start monitoring
checkStatus();
