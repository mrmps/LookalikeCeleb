import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Explicitly load env vars - this fixes the Bun/pnpm issue
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Make env vars available to the client
    define: {
      __VITE_PLAUSIBLE_DOMAIN__: JSON.stringify(env.VITE_PLAUSIBLE_DOMAIN),
      __VITE_PLAUSIBLE_HOST__: JSON.stringify(env.VITE_PLAUSIBLE_HOST),
    }
  };
});
