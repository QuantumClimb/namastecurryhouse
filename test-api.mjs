// Quick test script to verify API works
import fetch from 'node-fetch';

async function testAPI() {
  try {
    console.log('Testing /api/health...');
    const health = await fetch('http://localhost:3001/api/health');
    console.log('Health:', await health.json());
    
    console.log('\nTesting /api/menu...');
    const menu = await fetch('http://localhost:3001/api/menu');
    const data = await menu.json();
    
    if (data.error) {
      console.log('Error:', data);
    } else {
      console.log(`Success! Found ${data.length} categories`);
      console.log('Categories:', data.map(c => c.name).join(', '));
      console.log(`Total items: ${data.reduce((sum, cat) => sum + cat.items.length, 0)}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
