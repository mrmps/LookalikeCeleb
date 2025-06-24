import 'dotenv/config';
import { app } from "./hono";
import { serve } from '@hono/node-server';

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const HOST = '0.0.0.0'; // Always bind to all interfaces for Docker

serve({ fetch: app.fetch, port: PORT, hostname: HOST });
console.log(`🚀 Hono server running on http://${HOST}:${PORT}`);
console.log(`Environment PORT: ${process.env.PORT}`); 