import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { appRouter } from './routers';

dotenv.config();

const app = express();
const port = parseInt(process.env.API_PORT || '3000', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// tRPC API routes
app.use('/api/trpc', (req, res) => {
  // tRPC will handle the routing
  res.json({ message: 'tRPC endpoint' });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
  console.log(`📊 API available at http://localhost:${port}/api/trpc`);
});
