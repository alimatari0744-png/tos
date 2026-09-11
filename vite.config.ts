import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { tawoosDbPlugin } from "./vite-plugin-tawoos-db";

const isPages = process.env.GITHUB_PAGES === "true";
const base = isPages ? "/tos/" : "/";

export default defineConfig({
  plugins: [tawoosDbPlugin()],
  tanstackStart: {
    spa: isPages
      ? {
          enabled: true,
          prerender: {
            outputPath: "index.html",
            crawlLinks: false,
          },
        }
      : undefined,
    server: { entry: "server" },
  },
  nitro: isPages ? false : true,
  vite: {
    base,
    server: {
      port: 8080,
      strictPort: true,
      cors: true,
      watch: {
        ignored: ["**/data/db.json"],
      },
    },
  },
});
