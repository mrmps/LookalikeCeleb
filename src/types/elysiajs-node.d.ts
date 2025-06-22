declare module '@elysiajs/node' {
  import type { Adapter } from 'elysia';
  /**
   * Node.js adapter for Elysia ≥1.2
   * This minimal declaration is only to satisfy the TS compiler / IDE.
   * Remove once @elysiajs/node ships its own types.
   */
  export function node(): Adapter;
} 