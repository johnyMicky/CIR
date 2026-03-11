import express from 'express';
import db from './db.js';

const apiRouter = express.Router();

// Test route
apiRouter.get('/test', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API is working', 
    timestamp: new Date().toISOString(),
    env: {
      vercel: !!process.env.VERCEL,
      node_env: process.env.NODE_ENV
    }
  });
});

// Login
apiRouter.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`[API] Login attempt for user: ${username}`);
  
  if (!username || !password) {
    console.log('[API] Login failed: Missing username or password');
    return res.status(400).json({ error: 'Username and password are required' });
  }

  console.log(`[API] DB lookup for user: ${username}`);
  try {
    const user = await db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password) as any;
    
    if (user) {
      console.log(`[API] Login success for user: ${username}`);
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } else {
      console.log(`[API] Login failed for user: ${username} - No user found`);
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err: any) {
    console.error(`[API] DB Error during login: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user (me)
apiRouter.get('/me', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }

  try {
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (user) {
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err: any) {
    console.error(`[API] DB Error during get me: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Register
apiRouter.post('/register', async (req, res) => {
  const { username, password, name, email, country } = req.body;
  try {
    const result = await db.prepare('INSERT INTO users (username, password, role, name, email, country, btc_balance) VALUES (?, ?, ?, ?, ?, ?, 0)').run(
      username,
      password,
      'client',
      name,
      email,
      country
    );
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get all clients
apiRouter.get('/clients', async (req, res) => {
  try {
    const clients = await db.prepare('SELECT * FROM users WHERE role = ?').all('client');
    res.json(clients);
  } catch (error: any) {
    console.error('Error in /clients:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add transaction
apiRouter.post('/transactions', async (req, res) => {
  const { userId, amount, currency, source, status, type, created_at } = req.body;
  try {
    await db.prepare('BEGIN').run();

    const stmt = db.prepare(`
      INSERT INTO transactions (user_id, type, amount, currency, source, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = await stmt.run(
      Number(userId),
      type || 'Income',
      Number(amount),
      currency || 'BTC',
      source,
      status || 'Confirmed',
      created_at || new Date().toISOString()
    );

    const finalStatus = status || 'Confirmed';

    if (finalStatus === 'Confirmed') {
      let balanceColumn = 'btc_balance';
      if (currency === 'USDT') balanceColumn = 'usdt_balance';
      else if (currency === 'ETH') balanceColumn = 'eth_balance';
      else if (currency === 'SOL') balanceColumn = 'sol_balance';
      else if (currency === 'USD') balanceColumn = 'usd_balance';
      
      const isIncome = type === 'Income' || type === 'deposit' || type === 'exchange_in' || !type;
      const amountChange = isIncome ? Number(amount) : -Number(amount);
      
      await db.prepare(`UPDATE users SET ${balanceColumn} = ${balanceColumn} + ? WHERE id = ?`).run(amountChange, Number(userId));
    }

    await db.prepare('COMMIT').run();
    res.json({ success: true, id: result.lastInsertRowid });
  } catch (error: any) {
    await db.prepare('ROLLBACK').run();
    res.status(500).json({ error: error.message });
  }
});

// Get transactions
apiRouter.get('/transactions', async (req, res) => {
  const userId = req.query.userId;
  const isAdmin = req.query.isAdmin === 'true';

  if (isAdmin) {
     try {
       const transactions = await db.prepare(`
        SELECT t.*, u.username as client_username, u.name as client_name 
        FROM transactions t 
        LEFT JOIN users u ON t.user_id = u.id 
        ORDER BY t.created_at DESC
      `).all();
       res.json(transactions);
     } catch (error: any) {
       res.status(500).json({ error: error.message });
     }
  } else if (userId) {
     const transactions = await db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC').all(Number(userId));
     res.json(transactions);
  } else {
     res.status(400).json({ error: 'User ID required or admin access' });
  }
});

// Update transaction
apiRouter.put('/transactions/:id', async (req, res) => {
  const { amount, currency, source, status, type, created_at } = req.body;
  const id = req.params.id;
  try {
    await db.prepare('BEGIN').run();

    const tx = await db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as any;
    if (!tx) {
      await db.prepare('ROLLBACK').run();
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Revert old transaction if it was Confirmed
    if (tx.status === 'Confirmed') {
      let oldBalanceColumn = 'btc_balance';
      if (tx.currency === 'USDT') oldBalanceColumn = 'usdt_balance';
      else if (tx.currency === 'ETH') oldBalanceColumn = 'eth_balance';
      else if (tx.currency === 'SOL') oldBalanceColumn = 'sol_balance';
      else if (tx.currency === 'USD') oldBalanceColumn = 'usd_balance';

      const oldIsIncome = tx.type === 'Income' || tx.type === 'deposit' || tx.type === 'exchange_in' || !tx.type;
      const oldAmountChange = oldIsIncome ? -Number(tx.amount) : Number(tx.amount);

      await db.prepare(`UPDATE users SET ${oldBalanceColumn} = ${oldBalanceColumn} + ? WHERE id = ?`).run(oldAmountChange, Number(tx.user_id));
    }

    // Update the transaction record
    await db.prepare(`UPDATE transactions SET amount = ?, currency = ?, source = ?, status = ?, type = ?, created_at = ? WHERE id = ?`).run(amount, currency, source, status, type, created_at, id);

    // Apply new transaction if it is Confirmed
    if (status === 'Confirmed') {
      let newBalanceColumn = 'btc_balance';
      if (currency === 'USDT') newBalanceColumn = 'usdt_balance';
      else if (currency === 'ETH') newBalanceColumn = 'eth_balance';
      else if (currency === 'SOL') newBalanceColumn = 'sol_balance';
      else if (currency === 'USD') newBalanceColumn = 'usd_balance';

      const newIsIncome = type === 'Income' || type === 'deposit' || type === 'exchange_in' || !type;
      const newAmountChange = newIsIncome ? Number(amount) : -Number(amount);

      await db.prepare(`UPDATE users SET ${newBalanceColumn} = ${newBalanceColumn} + ? WHERE id = ?`).run(newAmountChange, Number(tx.user_id));
    }

    await db.prepare('COMMIT').run();
    res.json({ success: true });
  } catch (error: any) {
    await db.prepare('ROLLBACK').run();
    res.status(500).json({ error: error.message });
  }
});

// Update transaction status
apiRouter.patch('/transactions/:id/status', async (req, res) => {
  const { status } = req.body;
  const id = req.params.id;
  try {
    await db.prepare('BEGIN').run();

    const tx = await db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as any;
    if (!tx) {
      await db.prepare('ROLLBACK').run();
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (tx.status === status) {
      await db.prepare('ROLLBACK').run();
      return res.json({ success: true });
    }

    // Revert old transaction if it was Confirmed
    if (tx.status === 'Confirmed') {
      let oldBalanceColumn = 'btc_balance';
      if (tx.currency === 'USDT') oldBalanceColumn = 'usdt_balance';
      else if (tx.currency === 'ETH') oldBalanceColumn = 'eth_balance';
      else if (tx.currency === 'SOL') oldBalanceColumn = 'sol_balance';
      else if (tx.currency === 'USD') oldBalanceColumn = 'usd_balance';

      const oldIsIncome = tx.type === 'Income' || tx.type === 'deposit' || tx.type === 'exchange_in' || !tx.type;
      const oldAmountChange = oldIsIncome ? -Number(tx.amount) : Number(tx.amount);

      await db.prepare(`UPDATE users SET ${oldBalanceColumn} = ${oldBalanceColumn} + ? WHERE id = ?`).run(oldAmountChange, Number(tx.user_id));
    }

    // Update the transaction record
    await db.prepare(`UPDATE transactions SET amount = ?, currency = ?, source = ?, status = ?, type = ?, created_at = ? WHERE id = ?`).run(tx.amount, tx.currency, tx.source, status, tx.type, tx.created_at, id);

    // Apply new transaction if it is Confirmed
    if (status === 'Confirmed') {
      let newBalanceColumn = 'btc_balance';
      if (tx.currency === 'USDT') newBalanceColumn = 'usdt_balance';
      else if (tx.currency === 'ETH') newBalanceColumn = 'eth_balance';
      else if (tx.currency === 'SOL') newBalanceColumn = 'sol_balance';
      else if (tx.currency === 'USD') newBalanceColumn = 'usd_balance';

      const newIsIncome = tx.type === 'Income' || tx.type === 'deposit' || tx.type === 'exchange_in' || !tx.type;
      const newAmountChange = newIsIncome ? Number(tx.amount) : -Number(tx.amount);

      await db.prepare(`UPDATE users SET ${newBalanceColumn} = ${newBalanceColumn} + ? WHERE id = ?`).run(newAmountChange, Number(tx.user_id));
    }

    await db.prepare('COMMIT').run();
    res.json({ success: true });
  } catch (error: any) {
    await db.prepare('ROLLBACK').run();
    res.status(500).json({ error: error.message });
  }
});

// Delete transaction
apiRouter.delete('/transactions/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    await db.prepare('BEGIN').run();

    const tx = await db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as any;
    if (!tx) {
      await db.prepare('ROLLBACK').run();
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (tx.status === 'Confirmed') {
      let balanceColumn = 'btc_balance';
      if (tx.currency === 'USDT') balanceColumn = 'usdt_balance';
      else if (tx.currency === 'ETH') balanceColumn = 'eth_balance';
      else if (tx.currency === 'SOL') balanceColumn = 'sol_balance';
      else if (tx.currency === 'USD') balanceColumn = 'usd_balance';

      const isIncome = tx.type === 'Income' || tx.type === 'deposit' || tx.type === 'exchange_in' || !tx.type;
      const amountChange = isIncome ? -Number(tx.amount) : Number(tx.amount);

      await db.prepare(`UPDATE users SET ${balanceColumn} = ${balanceColumn} + ? WHERE id = ?`).run(amountChange, Number(tx.user_id));
    }

    const result = await db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
    
    await db.prepare('COMMIT').run();

    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Transaction not found' });
    }
  } catch (error: any) {
    await db.prepare('ROLLBACK').run();
    res.status(500).json({ error: error.message });
  }
});

// Update client
apiRouter.put('/clients/:id', async (req, res) => {
  const { btc_balance, btc_source, btc_status } = req.body;
  const clientId = req.params.id;
  try {
    await db.prepare('UPDATE users SET btc_balance = ?, btc_source = ?, btc_status = ? WHERE id = ?').run(btc_balance, btc_source, btc_status, clientId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update client wallets
apiRouter.patch('/users/:id/wallets', async (req, res) => {
  const { btc_address, eth_address, usdt_address } = req.body;
  const id = parseInt(req.params.id);
  try {
    await db.prepare('UPDATE users SET btc_address = ?, eth_address = ?, usdt_address = ? WHERE id = ?').run(btc_address, eth_address, usdt_address, id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error updating wallets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete client
apiRouter.delete('/clients/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await db.prepare('DELETE FROM transactions WHERE user_id = ?').run(id);
    await db.prepare('DELETE FROM reports WHERE client_id = ?').run(id);
    const result = await db.prepare('DELETE FROM users WHERE id = ?').run(id);
    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Client not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reset password
apiRouter.put('/clients/:id/reset-password', async (req, res) => {
  const { password } = req.body;
  const id = req.params.id;
  if (!password) return res.status(400).json({ error: 'Password is required' });
  try {
    const result = await db.prepare('UPDATE users SET password = ? WHERE id = ?').run(password, id);
    if (result.changes > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Client not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reports
apiRouter.get('/reports', async (req, res) => {
  try {
    const userId = req.query.userId;
    const role = req.query.role;
    if (role === 'admin') {
      const reports = await db.prepare(`
        SELECT r.*, u.name as client_name 
        FROM reports r 
        LEFT JOIN users u ON r.client_id = u.id
        ORDER BY created_at DESC
      `).all();
      res.json(reports);
    } else {
      const reports = await db.prepare('SELECT * FROM reports WHERE client_id = ? ORDER BY created_at DESC').all(userId);
      res.json(reports);
    }
  } catch (error: any) {
    console.error('Error in GET /reports:', error);
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/reports', async (req, res) => {
  try {
    const { title, description, content, client_id } = req.body;
    const result = await db.prepare('INSERT INTO reports (title, description, content, client_id) VALUES (?, ?, ?, ?)').run(
      title, description, content, client_id
    );
    res.json({ id: result.lastInsertRowid });
  } catch (error: any) {
    console.error('Error in POST /reports:', error);
    res.status(500).json({ error: error.message });
  }
});

apiRouter.put('/reports/:id', async (req, res) => {
  try {
    const { title, description, content, client_id } = req.body;
    await db.prepare('UPDATE reports SET title = ?, description = ?, content = ?, client_id = ? WHERE id = ?').run(
      title, description, content, client_id, req.params.id
    );
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error in PUT /reports:', error);
    res.status(500).json({ error: error.message });
  }
});

apiRouter.delete('/reports/:id', async (req, res) => {
  try {
    await db.prepare('DELETE FROM reports WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE /reports:', error);
    res.status(500).json({ error: error.message });
  }
});

export default apiRouter;
