#!/usr/bin/env node

/**
 * Check Resend Domain Status
 * Specifically checks namastecurry.house domain verification
 */

import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

console.log('🔍 Checking Resend Domain Status...\n');

async function checkDomainStatus() {
  try {
    const response = await resend.domains.list();
    
    console.log('📋 API Response:', JSON.stringify(response, null, 2));
    
    if (!response.data || response.data.length === 0) {
      console.log('\n⚠️  NO DOMAINS REGISTERED');
      console.log('═'.repeat(50));
      console.log('\n📝 Next Steps:');
      console.log('1. Go to: https://resend.com/domains');
      console.log('2. Click "Add Domain"');
      console.log('3. Enter: namastecurry.house');
      console.log('4. Resend will verify the DNS records you already added');
      console.log('5. Wait 5-10 minutes for verification');
      console.log('\nDNS records should already be in place from Namecheap! ✅');
      return;
    }

    console.log(`\n✅ Found ${response.data.length} domain(s)\n`);
    
    response.data.forEach((domain, index) => {
      console.log(`${index + 1}. ${domain.name}`);
      console.log(`   Status: ${domain.status}`);
      console.log(`   ID: ${domain.id}`);
      console.log(`   Region: ${domain.region}`);
      console.log(`   Created: ${new Date(domain.createdAt).toLocaleString()}`);
      
      if (domain.dnsProvider) {
        console.log(`   DNS Provider: ${domain.dnsProvider}`);
      }
      
      console.log('');
    });

    // Check for target domain
    const targetDomain = response.data.find(d => d.name === 'namastecurry.house');
    
    if (targetDomain) {
      console.log('🎯 TARGET DOMAIN FOUND: namastecurry.house');
      console.log('═'.repeat(50));
      console.log(`Status: ${targetDomain.status}`);
      
      if (targetDomain.status === 'verified') {
        console.log('✅ DOMAIN FULLY VERIFIED!');
        console.log('\n📧 You can now send from: orders@namastecurry.house');
        console.log('\n📝 Next Steps:');
        console.log('1. Update sender email in code');
        console.log('2. Set RESEND_TEST_MODE=false in Vercel');
        console.log('3. Redeploy and test');
      } else {
        console.log(`⏳ Status: ${targetDomain.status}`);
        console.log('\n💡 DNS verification in progress...');
        console.log('   This usually takes 5-15 minutes');
        console.log('   Check again in a few minutes');
      }
    } else {
      console.log('❌ namastecurry.house NOT FOUND');
      console.log('\n📝 Action Required:');
      console.log('→ Add domain at: https://resend.com/domains');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDomainStatus();
