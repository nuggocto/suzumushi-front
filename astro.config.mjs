// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Static-first by design. Cloudflare Pages can serve `dist/` without an adapter.
export default defineConfig({
  site: "https://suzumushi.org",
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
