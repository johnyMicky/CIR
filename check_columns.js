import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  if (error) {
    console.error('Error fetching users:', error);
  } else {
    console.log('Columns in users table:');
    if (data && data.length > 0) {
      console.log(Object.keys(data[0]));
    } else {
      console.log('No data found, cannot infer columns from empty table easily via JS client without RPC.');
    }
  }
}

checkColumns();
