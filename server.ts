import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRouter from './api/api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isVercel = !!process.env.VERCEL || !!process.env.Vercel || !!process.env.VERCEL_ENV;

const app = express();
const PORT = 3000;

app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Vite/Static Files
async function startServer() {
  if (process.env.NODE_ENV !== 'production' && !isVercel) {
    console.log('Starting in DEVELOPMENT mode with Vite middleware');
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.error('Failed to start Vite server:', e);
    }
  } else if (!isVercel) {
    console.log('Starting in LOCAL PRODUCTION mode serving static files');
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res, next) => {
        if (req.url.startsWith('/api/')) return next();
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  if (!isVercel) {
    console.log(`Attempting to listen on port ${PORT}...`);
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is now listening on http://0.0.0.0:${PORT}`);
    });
  }
}

console.log('Starting server initialization...');
startServer().catch(err => {
  console.error('CRITICAL: Server failed to start:', err);
});

export default app;
