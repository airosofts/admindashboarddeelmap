import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://caoynokephxfyqofpufv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhb3lub2tlcGh4Znlxb2ZwdWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MTk4NTUsImV4cCI6MjA3Mjk5NTg1NX0.bTz4dNQ1N-8MGjnm7Cp6afViiL-4blSV4UX8CrmsYpE';

const propertyId = 'd4cb8bbc-6ce4-45e0-8e06-14f8b7a555c3';

console.log('🔬 Testing different query approaches...\n');

// Test 1: Standard Supabase client
console.log('1️⃣ Testing with standard client config...');
const client1 = createClient(supabaseUrl, supabaseAnonKey);
const start1 = Date.now();
const { data: data1, error: error1 } = await client1
  .from('property_photos')
  .select('id, photo_url, is_featured, display_order')
  .eq('deal_id', propertyId);
console.log(`   Time: ${Date.now() - start1}ms`);
console.log(`   Found: ${data1?.length || 0} photos`);
if (error1) console.error('   Error:', error1);

// Test 2: Without ordering
console.log('\n2️⃣ Testing without ORDER BY...');
const start2 = Date.now();
const { data: data2, error: error2 } = await client1
  .from('property_photos')
  .select('id, photo_url, is_featured, display_order')
  .eq('deal_id', propertyId);
console.log(`   Time: ${Date.now() - start2}ms`);
console.log(`   Found: ${data2?.length || 0} photos`);
if (error2) console.error('   Error:', error2);

// Test 3: Only essential columns
console.log('\n3️⃣ Testing with minimal columns...');
const start3 = Date.now();
const { data: data3, error: error3 } = await client1
  .from('property_photos')
  .select('id, photo_url')
  .eq('deal_id', propertyId);
console.log(`   Time: ${Date.now() - start3}ms`);
console.log(`   Found: ${data3?.length || 0} photos`);
if (error3) console.error('   Error:', error3);

// Test 4: Using filter instead of eq
console.log('\n4️⃣ Testing with filter()...');
const start4 = Date.now();
const { data: data4, error: error4 } = await client1
  .from('property_photos')
  .select('id, photo_url, is_featured, display_order')
  .filter('deal_id', 'eq', propertyId);
console.log(`   Time: ${Date.now() - start4}ms`);
console.log(`   Found: ${data4?.length || 0} photos`);
if (error4) console.error('   Error:', error4);

// Test 5: Direct REST API call
console.log('\n5️⃣ Testing direct REST API call...');
const start5 = Date.now();
try {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/property_photos?deal_id=eq.${propertyId}&select=id,photo_url,is_featured,display_order`,
    {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    }
  );
  const data5 = await response.json();
  console.log(`   Time: ${Date.now() - start5}ms`);
  console.log(`   Found: ${data5?.length || 0} photos`);
} catch (err) {
  console.error('   Error:', err.message);
}

console.log('\n✅ Tests complete');
