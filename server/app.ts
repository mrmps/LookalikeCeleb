import { Elysia, t } from "elysia";
import { staticPlugin } from "@elysiajs/static";
import { node } from "@elysiajs/node";
import fs from "node:fs";

// Change if client build output differs
const CLIENT_DIST_PATH = new URL("../dist", import.meta.url).pathname;

export const app = (() => {
  const base = new Elysia({ prefix: "/api", adapter: node() })
  // Basic routes
  base.get("/", () => ({ ok: true }))
  base.get("/hello", () => ({ message: "Hello from Elysia server!" }))
  base.get(
    "/user/:id",
    ({ params }) => {
      const { id } = params;
      return { id, name: "Jane Doe" };
    },
    {
      params: t.Object({ id: t.String() }),
    },
  )

  if (fs.existsSync(CLIENT_DIST_PATH)) {
    base.use(
      staticPlugin({
        assets: CLIENT_DIST_PATH,
        prefix: "/",
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      }),
    );
  }

  return base;
})();

export type App = typeof app; 