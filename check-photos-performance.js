import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://caoynokephxfyqofpufv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhb3lub2tlcGh4Znlxb2ZwdWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MTk4NTUsImV4cCI6MjA3Mjk5NTg1NX0.bTz4dNQ1N-8MGjnm7Cp6afViiL-4blSV4UX8CrmsYpE';

const supabaseScraper = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  db: {
    schema: 'public',
  }
});

const checkDatabase = async () => {
  console.log('📊 Checking property_photos table performance...\n');

  try {
    // Check total row count
    console.log('1. Checking total row count...');
    const startCount = Date.now();
    const { count, error: countError } = await supabaseScraper
      .from('property_photos')
      .select('*', { count: 'exact', head: true });
    console.log(`   Total rows: ${count}`);
    console.log(`   Query time: ${Date.now() - startCount}ms\n`);

    if (countError) {
      console.error('   Error:', countError);
      return;
    }

    // Check if there are photos for a specific property
    console.log('2. Checking photos for property d4cb8bbc-6ce4-45e0-8e06-14f8b7a555c3...');
    const startSpecific = Date.now();
    const { data, error } = await supabaseScraper
      .from('property_photos')
      .select('id, photo_url, is_featured, display_order, deal_id')
      .eq('deal_id', 'd4cb8bbc-6ce4-45e0-8e06-14f8b7a555c3')
      .order('display_order', { ascending: true });
    const specificTime = Date.now() - startSpecific;
    console.log(`   Found: ${data?.length || 0} photos`);
    console.log(`   Query time: ${specificTime}ms\n`);

    if (error) {
      console.error('   Error:', error);
      return;
    }

    if (data && data.length > 0) {
      console.log('   Sample photo:', {
        id: data[0].id,
        is_featured: data[0].is_featured,
        display_order: data[0].display_order
      });
    }

    // Check for NULL deal_ids
    console.log('\n3. Checking for NULL deal_ids...');
    const startNull = Date.now();
    const { count: nullCount, error: nullError } = await supabaseScraper
      .from('property_photos')
      .select('*', { count: 'exact', head: true })
      .is('deal_id', null);
    console.log(`   NULL deal_ids: ${nullCount}`);
    console.log(`   Query time: ${Date.now() - startNull}ms\n`);

    if (nullError) {
      console.error('   Error:', nullError);
    }

    // Try fetching all photos for all properties
    console.log('4. Checking all photos (to understand table size)...');
    const startAll = Date.now();
    const { data: allData, error: allError } = await supabaseScraper
      .from('property_photos')
      .select('deal_id')
      .limit(1000);
    const allTime = Date.now() - startAll;
    console.log(`   Fetched: ${allData?.length || 0} photos`);
    console.log(`   Query time: ${allTime}ms\n`);

    if (allError) {
      console.error('   Error:', allError);
    }

    // Summary
    console.log('📋 SUMMARY:');
    console.log(`   Total photos in database: ${count}`);
    console.log(`   Photo fetch for specific property: ${specificTime}ms`);
    console.log(`   Photos found for test property: ${data?.length || 0}`);

    if (specificTime > 5000) {
      console.log('\n⚠️  WARNING: Query is taking more than 5 seconds!');
      console.log('   This suggests the index might not be working properly.');
    }

  } catch (err) {
    console.error('Exception:', err);
  }
};

checkDatabase();
