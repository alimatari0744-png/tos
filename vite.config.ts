import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isPages = process.env.GITHUB_PAGES === "true";
const base = isPages ? "/tos/" : "/";

export default defineConfig({
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
  },
});
