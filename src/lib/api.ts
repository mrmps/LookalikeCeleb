import { treaty } from "@elysiajs/eden";
import type { App } from "@shared/app";

/**
 * Singleton treaty client to interact with the Elysia backend with full
 * end-to-end type-safety.
 *
 * During development the backend runs on localhost:3001 by default. At build
 * time you can override the endpoint via the `VITE_API_URL` environment
 * variable.
 */
export const api = treaty<App>(
  import.meta.env.VITE_API_URL ?? "http://localhost:3001/api",
); 