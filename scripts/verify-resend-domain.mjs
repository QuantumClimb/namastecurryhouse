#!/usr/bin/env node

/**
 * Trigger Resend Domain Verification
 * This will make Resend check your DNS records
 */

import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);
const DOMAIN_ID = 'ae58493f-bc33-43bf-a8f0-abce4ef2df79';

console.log('🔄 Triggering Domain Verification...\n');

async function verifyDomain() {
  try {
    // Get current status
    console.log('📋 Checking current status...');
    const current = await resend.domains.get(DOMAIN_ID);
    
    console.log(`Domain: ${current.data.name}`);
    console.log(`Current Status: ${current.data.status}\n`);

    if (current.data.status === 'verified') {
      console.log('✅ Domain is already verified!');
      console.log('\n📧 You can now send from: orders@namastecurry.house');
      return;
    }

    // Trigger verification
    console.log('🔍 Triggering DNS verification...');
    const result = await resend.domains.verify(DOMAIN_ID);
    
    console.log('\n📊 Verification Result:');
    console.log('═'.repeat(60));
    console.log(JSON.stringify(result, null, 2));
    
    if (result.data.status === 'verified') {
      console.log('\n🎉 SUCCESS! Domain is now verified!');
      console.log('✅ You can send emails from: orders@namastecurry.house');
      console.log('\n📝 Next Steps:');
      console.log('1. Update sender email in code');
      console.log('2. Set RESEND_TEST_MODE=false in Vercel');
      console.log('3. Redeploy application');
    } else if (result.data.status === 'pending') {
      console.log('\n⏳ Verification in progress...');
      console.log('   DNS records are being checked');
      console.log('   This may take a few minutes');
      console.log('\n   Run this script again in 2-3 minutes');
    } else if (result.data.status === 'failed') {
      console.log('\n❌ Verification failed');
      console.log('\n💡 Possible issues:');
      console.log('   • DNS records not propagated yet (wait 15-30 min)');
      console.log('   • DNS records have typos');
      console.log('   • TTL too high');
      console.log('\n   Check records at: https://resend.com/domains/' + DOMAIN_ID);
    }

    // Show DNS record status
    if (result.data.records && result.data.records.length > 0) {
      console.log('\n\n📋 DNS Records Status:');
      console.log('═'.repeat(60));
      for (const record of result.data.records) {
        const icon = record.status === 'verified' ? '✅' : 
                     record.status === 'pending' ? '⏳' : 
                     record.status === 'failed' ? '❌' : '⚪';
        console.log(`${icon} ${record.record} (${record.type}): ${record.status || 'not_started'}`);
        if (record.status === 'failed') {
          console.log(`   Expected: ${record.value.substring(0, 50)}...`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('already verified')) {
      console.log('✅ Domain is already verified!');
    } else if (error.message.includes('not found')) {
      console.log('❌ Domain not found. Check domain ID.');
    } else {
      console.error('Full error:', error);
    }
  }
}

console.log('⏰ Waiting 5 seconds for DNS propagation check...\n');

setTimeout(() => {
  verifyDomain();
}, 5000);
