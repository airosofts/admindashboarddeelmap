// Simple test file to check Supabase Scraper connection speed
import { supabaseScraper } from './lib/supabaseScraper.js';

console.log('Testing Supabase Scraper connection...');
console.time('Query Time');

const testQuery = async () => {
  try {
    const { data, error } = await supabaseScraper
      .from('wholesale_deals')
      .select('id, address, created_at')
      .limit(5);

    console.timeEnd('Query Time');

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success! Found', data.length, 'properties');
      console.log('First property:', data[0]);
    }
  } catch (err) {
    console.timeEnd('Query Time');
    console.error('Exception:', err);
  }
};

testQuery();
