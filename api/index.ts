import express from 'express';
import apiRouter from './api.js';

const app = express();
app.use(express.json());

// Log all requests for debugging on Vercel
app.use((req, res, next) => {
  console.log(`[API] Request: ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health-check', (req, res) => {
  res.json({ 
    status: 'ok', 
    source: 'api/index.ts',
    routerLoaded: true,
    timestamp: new Date().toISOString(),
    env: {
      VERCEL: !!process.env.VERCEL,
      Vercel: !!process.env.Vercel,
      VERCEL_ENV: process.env.VERCEL_ENV,
      NODE_ENV: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY
    }
  });
});

// Use router
app.use('/api', apiRouter);

// Fallback for 404
app.use((req, res, next) => {
  console.log(`[API] 404 Not Found: ${req.url}`);
  res.status(404).json({ error: `Not Found: ${req.url}` });
});

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('[API ERROR]', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: err.message
  });
});

export default app;
