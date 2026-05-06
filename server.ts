import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import app from './app.js';

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  const isProduction = process.env.NODE_ENV === "production" || !!process.env.RENDER;
  
  if (!isProduction) {
    console.log('Running in DEVELOPMENT mode with Vite middleware');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      res.sendFile(indexPath);
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
