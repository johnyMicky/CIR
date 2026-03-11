/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL_KEY = 'supabase_url';
const SUPABASE_KEY_KEY = 'supabase_key';

export const getSupabaseConfig = () => {
  return {
    url: localStorage.getItem(SUPABASE_URL_KEY) || import.meta.env.VITE_SUPABASE_URL || '',
    key: localStorage.getItem(SUPABASE_KEY_KEY) || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  };
};

export const setSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem(SUPABASE_URL_KEY, url);
  localStorage.setItem(SUPABASE_KEY_KEY, key);
};

export const getSupabaseClient = () => {
  const { url, key } = getSupabaseConfig();
  if (!url || !key) return null;
  return createClient(url, key);
};

export const checkSupabaseConnection = async () => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Configuration missing' };
  }

  try {
    // Try a simple query. We assume a 'users' table exists or just check health if possible.
    // Since we might not have tables yet, we can try to get the session or just a simple select.
    // However, without tables, select might fail.
    // Let's try to list buckets or something generic if possible, or just auth.getUser() (which won't work without a token).
    // Best bet: select count from a table we expect, or handle the error "relation does not exist" as a connection success (because it reached the DB).
    
    const { error } = await client.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      // If error is about permission or missing table, we still connected!
      // If error is network error or invalid key, we failed.
      if (error.message.includes('fetch') || error.message.includes('apikey')) {
        return { success: false, message: error.message };
      }
      return { success: true, message: `Connected! (Note: ${error.message})` };
    }
    
    return { success: true, message: 'Connection successful' };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
};
