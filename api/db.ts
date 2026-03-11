import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
const supabaseKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL: Missing Supabase URL or Key. Database operations will fail.');
}

// Supabase Database Implementation
class SupabaseDatabase {
  supabase: any;
  url: string;
  key: string;
  initPromise: Promise<void> | null = null;

  constructor(url: string, key: string) {
    this.url = url;
    this.key = key;
  }

  async ensureInitialized() {
    if (this.supabase) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        console.log('DB: Initializing Supabase client...');
        if (!this.url || !this.key) {
          throw new Error('Supabase URL or Key is missing');
        }
        this.supabase = createClient(this.url, this.key);
        console.log('DB: Supabase client initialized successfully');
      } catch (err) {
        console.error('DB: Failed to initialize Supabase client:', err);
        throw err;
      }
    })();

    return this.initPromise;
  }

  async exec(sql: string) {
    await this.ensureInitialized();
    console.log('SupabaseDB: exec called (ignored for now)', sql);
    return this;
  }

  prepare(sql: string) {
    const self = this;
    return {
      run: async (...args: any[]) => {
        await self.ensureInitialized();
        const supabase = self.supabase;
        
        console.log('SupabaseDB: run called', sql, args);
        
        if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') {
          return { changes: 0 };
        }

        // INSERT INTO users
        if (sql.includes('INSERT INTO users')) {
          const [username, password, role, name, email, country] = args;
          const { data, error } = await supabase.from('users').insert([{ username, password, role, name, email, country, btc_balance: 0 }]).select();
          if (error) throw error;
          return { lastInsertRowid: data[0]?.id, changes: 1 };
        }

        // INSERT INTO transactions
        if (sql.includes('INSERT INTO transactions')) {
          const [user_id, type, amount, currency, source, status, created_at] = args;
          const { data, error } = await supabase.from('transactions').insert([{ user_id, type, amount, currency, source, status, created_at }]).select();
          if (error) throw error;
          return { lastInsertRowid: data[0]?.id, changes: 1 };
        }

        // INSERT INTO reports
        if (sql.includes('INSERT INTO reports')) {
          const [title, description, content, client_id] = args;
          const { data, error } = await supabase.from('reports').insert([{ title, description, content, client_id }]).select();
          if (error) throw error;
          return { lastInsertRowid: data[0]?.id, changes: 1 };
        }

        // UPDATE users (balance increment/decrement)
        if (sql.includes('UPDATE users SET') && sql.includes('+ ?')) {
          const [amount, userId] = args;
          const colMatch = sql.match(/SET (\w+) =/);
          const col = colMatch ? colMatch[1] : 'btc_balance';
          
          const { data: user } = await supabase.from('users').select(col).eq('id', userId).single();
          const newBalance = Number(user?.[col] || 0) + Number(amount);
          
          const { error } = await supabase.from('users').update({ [col]: newBalance }).eq('id', userId);
          if (error) throw error;
          return { changes: 1 };
        }

        // UPDATE users (wallets)
        if (sql.includes('UPDATE users SET btc_address = ?, eth_address = ?, usdt_address = ? WHERE id = ?')) {
          const [btc_address, eth_address, usdt_address, id] = args;
          const { error } = await supabase.from('users').update({ btc_address, eth_address, usdt_address }).eq('id', id);
          if (error) {
            console.error('Supabase update error for wallets:', error);
            throw error;
          }
          return { changes: 1 };
        }

        // UPDATE users (general)
        if (sql.includes('UPDATE users SET btc_balance = ?')) {
          const [btc_balance, btc_source, btc_status, id] = args;
          const { error } = await supabase.from('users').update({ btc_balance, btc_source, btc_status }).eq('id', id);
          if (error) throw error;
          return { changes: 1 };
        }

        // UPDATE users (password)
        if (sql.includes('UPDATE users SET password = ?')) {
          const [password, id] = args;
          const { error } = await supabase.from('users').update({ password }).eq('id', id);
          if (error) throw error;
          return { changes: 1 };
        }

        // UPDATE transactions
        if (sql.includes('UPDATE transactions SET')) {
          const [amount, currency, source, status, type, created_at, id] = args;
          const { error } = await supabase.from('transactions').update({ amount, currency, source, status, type, created_at }).eq('id', id);
          if (error) throw error;
          return { changes: 1 };
        }

        // UPDATE reports
        if (sql.includes('UPDATE reports SET')) {
          const [title, description, content, client_id, id] = args;
          const { error } = await supabase.from('reports').update({ title, description, content, client_id }).eq('id', id);
          if (error) throw error;
          return { changes: 1 };
        }

        // DELETE FROM transactions
        if (sql.includes('DELETE FROM transactions WHERE id = ?')) {
          const { error } = await supabase.from('transactions').delete().eq('id', args[0]);
          if (error) throw error;
          return { changes: 1 };
        }
        if (sql.includes('DELETE FROM transactions WHERE user_id = ?')) {
          const { error } = await supabase.from('transactions').delete().eq('user_id', args[0]);
          if (error) throw error;
          return { changes: 1 };
        }

        // DELETE FROM reports
        if (sql.includes('DELETE FROM reports')) {
          const col = sql.includes('client_id') ? 'client_id' : 'id';
          const { error } = await supabase.from('reports').delete().eq(col, args[0]);
          if (error) throw error;
          return { changes: 1 };
        }

        // DELETE FROM users
        if (sql.includes('DELETE FROM users')) {
          const { error } = await supabase.from('users').delete().eq('id', args[0]);
          if (error) throw error;
          return { changes: 1 };
        }

        return { changes: 0 };
      },
      get: async (...args: any[]) => {
        await self.ensureInitialized();
        const supabase = self.supabase;
        
        console.log('SupabaseDB: get called', sql, args);
        
        // SELECT * FROM users WHERE username = ? AND password = ?
        if (sql.includes('FROM users WHERE username = ? AND password = ?')) {
          const { data, error } = await supabase.from('users').select('*').eq('username', args[0]).eq('password', args[1]).maybeSingle();
          if (error) throw error;
          return data;
        }

        // SELECT * FROM users WHERE id = ?
        if (sql.includes('FROM users WHERE id = ?')) {
          const { data, error } = await supabase.from('users').select('*').eq('id', args[0]).maybeSingle();
          if (error) throw error;
          return data;
        }

        // SELECT * FROM users WHERE username = ?
        if (sql.includes('FROM users WHERE username = ?')) {
          const { data, error } = await supabase.from('users').select('*').eq('username', args[0]).maybeSingle();
          if (error) throw error;
          return data;
        }

        // SELECT * FROM transactions WHERE id = ?
        if (sql.includes('FROM transactions WHERE id = ?')) {
          const { data, error } = await supabase.from('transactions').select('*').eq('id', args[0]).maybeSingle();
          if (error) throw error;
          return data;
        }

        return null;
      },
      all: async (...args: any[]) => {
        await self.ensureInitialized();
        const supabase = self.supabase;
        
        console.log('SupabaseDB: all called', sql, args);

        // SELECT FROM users WHERE role = ?
        if (sql.includes('FROM users WHERE role = ?')) {
          const { data, error } = await supabase.from('users').select('*').eq('role', args[0]);
          if (error) throw error;
          return data || [];
        }

        // SELECT FROM transactions
        if (sql.includes('FROM transactions')) {
          let query = supabase.from('transactions').select('*, users(username, name)');
          if (sql.includes('WHERE user_id = ?')) {
            query = query.eq('user_id', args[0]);
          }
          const { data, error } = await query.order('created_at', { ascending: false });
          if (error) throw error;
          
          // Flatten user data if needed
          return (data || []).map((t: any) => ({
            ...t,
            client_username: t.users?.username,
            client_name: t.users?.name
          }));
        }

        // SELECT FROM reports
        if (sql.includes('FROM reports')) {
          let query = supabase.from('reports').select('*, users(name)');
          if (sql.includes('WHERE client_id = ?')) {
            query = query.eq('client_id', args[0]);
          }
          const { data, error } = await query.order('created_at', { ascending: false });
          if (error) throw error;
          
          return (data || []).map((r: any) => ({
            ...r,
            client_name: r.users?.name
          }));
        }

        return [];
      }
    };
  }
}

// Create a single instance
const dbInstance = new SupabaseDatabase(supabaseUrl, supabaseKey);

// Database interface proxy
export const db = new Proxy({} as any, {
  get: (target, prop) => {
    const value = (dbInstance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(dbInstance);
    }
    return value;
  }
});

export default db;
