import { app } from "./app";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.listen(PORT, ({ port }) => {
  console.log(`🦊 Elysia server is running on http://localhost:${port}/api`);
}); 