import { app } from "./hono";
import { serve } from '@hono/node-server';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

serve({ fetch: app.fetch, port: PORT });
console.log(`🚀 Hono server running on http://localhost:${PORT}`); 