import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';

// Dummy celebrity matches data
const matches = [
  {
    name: 'Ryan Gosling',
    percentage: 89,
    image: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=400&q=80',
    description: 'Canadian Actor',
    confidence: 'Very High',
    category: 'Hollywood Star',
  },
  {
    name: 'Chris Evans',
    percentage: 84,
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80',
    description: 'Marvel Superhero',
    confidence: 'High',
    category: 'Action Star',
  },
  {
    name: 'Michael B. Jordan',
    percentage: 78,
    image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=400&q=80',
    description: 'Award-winning Actor',
    confidence: 'High',
    category: 'Rising Star',
  },
];

// Create Hono app with CORS and proper route typing
export const app = new Hono()
  .use('*', cors({
    origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082', 'http://localhost:8083', 'http://localhost:8084'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }))
  .get('/api/matches', (c) => {
    return c.json({ matches });
  });

// Convenience bootstrap if run directly with tsx/bun/node
if (import.meta.url === `file://${process.argv[1]}`) {
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
  serve({ fetch: app.fetch, port: PORT });
  console.log(`🚀 Hono server running on http://localhost:${PORT}`);
}

// Export the app type for RPC client
export type AppType = typeof app; 