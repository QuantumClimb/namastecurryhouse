#!/usr/bin/env node

/**
 * Get Resend Domain Details and DNS Records
 */

import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

console.log('🔍 Checking Domain: namastecurry.house\n');

async function getDomainDetails() {
  try {
    // Get the domain ID first
    const list = await resend.domains.list();
    
    if (!list.data || !list.data.data || list.data.data.length === 0) {
      console.log('❌ No domains found. Please add domain first.');
      return;
    }

    const domain = list.data.data.find(d => d.name === 'namastecurry.house');
    
    if (!domain) {
      console.log('❌ Domain namastecurry.house not found');
      return;
    }

    console.log('📋 Domain Information:');
    console.log('═'.repeat(60));
    console.log(`Name: ${domain.name}`);
    console.log(`Status: ${domain.status}`);
    console.log(`Region: ${domain.region}`);
    console.log(`Created: ${new Date(domain.created_at).toLocaleString()}`);
    console.log(`ID: ${domain.id}`);

    console.log('\n📊 Current Status: ' + domain.status.toUpperCase());
    
    if (domain.status === 'not_started') {
      console.log('\n⚠️  DNS VERIFICATION NOT STARTED');
      console.log('═'.repeat(60));
      console.log('\n💡 This means Resend hasn\'t checked your DNS records yet.');
      console.log('\n📝 Steps to Verify:');
      console.log('1. Go to: https://resend.com/domains');
      console.log('2. Click on "namastecurry.house"');
      console.log('3. Click "Verify DNS Records" or similar button');
      console.log('4. Resend will check your Namecheap DNS records');
      console.log('5. Verification should complete in 1-2 minutes');
      
      console.log('\n✅ Your DNS records are already added in Namecheap:');
      console.log('   • DKIM (resend._domainkey)');
      console.log('   • SPF (@)');
      console.log('   • MX (@)');
      console.log('   • DMARC (_dmarc)');
    } else if (domain.status === 'pending') {
      console.log('\n⏳ VERIFICATION IN PROGRESS');
      console.log('   Resend is checking your DNS records...');
      console.log('   This usually takes 1-5 minutes');
    } else if (domain.status === 'verified') {
      console.log('\n✅ DOMAIN FULLY VERIFIED!');
      console.log('   You can now send emails from: orders@namastecurry.house');
    }

    // Try to get DNS records
    console.log('\n\n🔍 Attempting to fetch DNS records...');
    try {
      const domainDetails = await resend.domains.get(domain.id);
      console.log('\n📋 Domain Details:');
      console.log(JSON.stringify(domainDetails, null, 2));
    } catch (err) {
      console.log('ℹ️  DNS records not available via API');
      console.log('   View them at: https://resend.com/domains/' + domain.id);
    }

    console.log('\n\n' + '═'.repeat(60));
    console.log('🔗 Quick Links:');
    console.log('═'.repeat(60));
    console.log('Dashboard: https://resend.com/domains');
    console.log('Domain Settings: https://resend.com/domains/' + domain.id);
    console.log('Email Logs: https://resend.com/emails');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

getDomainDetails();
