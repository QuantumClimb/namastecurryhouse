// Check production database image storage status

async function checkProductionImageStorage() {
  try {
    console.log('🔍 Checking Production Database Image Storage');
    console.log('=============================================\n');
    
    // Test the health endpoint
    console.log('1. API Health Check:');
    const healthResponse = await fetch('https://namastecurryhouse.vercel.app/api/health');
    const health = await healthResponse.json();
    console.log(`   Status: ${health.status}`);
    console.log(`   Database: ${health.database}`);
    
    // Test the diagnostics
    console.log('\n2. Database Diagnostics:');
    const diagResponse = await fetch('https://namastecurryhouse.vercel.app/api/db/diagnostics');
    const diag = await diagResponse.json();
    console.log(`   Connected: ${diag.db.connected}`);
    console.log(`   Categories: ${diag.db.counts.categories}`);
    console.log(`   Items: ${diag.db.counts.items}`);
    
    // Test menu API
    console.log('\n3. Menu API Check:');
    const menuResponse = await fetch('https://namastecurryhouse.vercel.app/api/menu');
    const menu = await menuResponse.json();
    
    if (menu.length > 0 && menu[0].items.length > 0) {
      const firstItem = menu[0].items[0];
      console.log(`   Sample Item: ${firstItem.name}`);
      console.log(`   Image URL: ${firstItem.imageUrl}`);
      console.log(`   Using database images: ${firstItem.imageUrl.startsWith('/api/images/')}`);
      
      // If using placeholder, check if database image endpoint exists
      if (!firstItem.imageUrl.startsWith('/api/images/')) {
        console.log('\n4. Testing Database Image Endpoint:');
        try {
          const testImageResponse = await fetch(`https://namastecurryhouse.vercel.app/api/images/${firstItem.id}`);
          console.log(`   Image endpoint status: ${testImageResponse.status}`);
          if (testImageResponse.ok) {
            console.log(`   Content-Type: ${testImageResponse.headers.get('content-type')}`);
            console.log('   ✅ Database images available but not being used by menu API');
          } else {
            console.log('   ❌ Database images not available - migration needed');
          }
        } catch (error) {
          console.log(`   ❌ Database image endpoint error: ${error.message}`);
        }
      }
    }
    
    console.log('\n📊 Production Status Summary:');
    console.log('============================');
    const dbImagesUsed = menu.some(cat => 
      cat.items.some(item => item.imageUrl && item.imageUrl.startsWith('/api/images/'))
    );
    
    if (dbImagesUsed) {
      console.log('✅ Production is using database image storage');
      console.log('✅ Migration was successful');
    } else {
      console.log('⚠️  Production is still using placeholder images');
      console.log('🔧 Migration may need to be run on production database');
    }
    
  } catch (error) {
    console.error('❌ Production check failed:', error.message);
  }
}

checkProductionImageStorage();