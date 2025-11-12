#!/usr/bin/env node

/**
 * Check DNS Propagation Status
 * Verifies all Resend DNS records are propagated
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('🔍 Checking DNS Propagation for namastecurry.house\n');
console.log('═'.repeat(60));

async function checkDNS(type, host, expectedValue = null) {
  try {
    const { stdout } = await execAsync(`nslookup -type=${type} ${host} 8.8.8.8`);
    
    const hasRecord = stdout.includes(expectedValue || host);
    const status = hasRecord ? '✅' : '❌';
    
    console.log(`\n${status} ${type} Record: ${host}`);
    if (expectedValue) {
      console.log(`   Expected: ${expectedValue}`);
    }
    
    // Show relevant lines
    const lines = stdout.split('\n').filter(line => 
      line.includes('text =') || 
      line.includes('mail exchanger') ||
      line.includes('MX preference') ||
      line.toLowerCase().includes('answer')
    );
    
    if (lines.length > 0) {
      console.log('   Found:');
      lines.forEach(line => console.log('   ' + line.trim()));
    } else {
      console.log('   ⚠️  Not found or still propagating');
    }
    
    return hasRecord;
    
  } catch (error) {
    console.log(`\n❌ ${type} Record: ${host}`);
    console.log('   Error or not found yet');
    return false;
  }
}

async function checkAllRecords() {
  console.log('\n📋 Required DNS Records:\n');
  
  const results = {
    dkim: false,
    spf: false,
    mx: false,
    dmarc: false
  };
  
  // Check DKIM
  results.dkim = await checkDNS(
    'TXT',
    'resend._domainkey.namastecurry.house',
    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDR8pMYHvB9VabyoD7eeBMEz78B'
  );
  
  // Check SPF
  results.spf = await checkDNS(
    'TXT',
    'send.namastecurry.house',
    'v=spf1 include:amazonses.com'
  );
  
  // Check MX
  results.mx = await checkDNS(
    'MX',
    'send.namastecurry.house',
    'feedback-smtp.eu-west-1.amazonses.com'
  );
  
  // Check DMARC
  results.dmarc = await checkDNS(
    'TXT',
    '_dmarc.namastecurry.house',
    'v=DMARC1'
  );
  
  // Summary
  console.log('\n\n' + '═'.repeat(60));
  console.log('📊 DNS Propagation Summary:');
  console.log('═'.repeat(60));
  
  const verified = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log(`\n${verified}/${total} records propagated\n`);
  
  Object.entries(results).forEach(([name, status]) => {
    const icon = status ? '✅' : '⏳';
    console.log(`${icon} ${name.toUpperCase()}: ${status ? 'Verified' : 'Pending'}`);
  });
  
  if (verified === total) {
    console.log('\n🎉 All DNS records are propagated!');
    console.log('   Resend should verify soon (1-5 minutes)');
    console.log('\n   Run: node scripts/verify-resend-domain.mjs');
  } else {
    console.log('\n⏰ DNS propagation in progress...');
    console.log('   This can take 15-60 minutes');
    console.log('   Check again in 10 minutes');
  }
  
  console.log('\n💡 Tip: You can also check at:');
  console.log('   https://dnschecker.org/#TXT/resend._domainkey.namastecurry.house');
  console.log('\n');
}

checkAllRecords();
