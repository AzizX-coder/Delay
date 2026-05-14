import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logo.png", "logo-192.png", "logo-512.png"],
      manifest: {
        name: "Delay",
        short_name: "Delay",
        description: "Your second brain for deep work — notes, tasks, flows, focus.",
        theme_color: "#1a1a2e",
        background_color: "#0d0d14",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "/logo-192.png", sizes: "192x192", type: "image/png" },
          { src: "/logo-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
        shortcuts: [
          { name: "New Note", short_name: "Note", url: "/?module=notes&new=1", icons: [{ src: "/logo-192.png", sizes: "192x192" }] },
          { name: "Focus Timer", short_name: "Focus", url: "/?module=timer", icons: [{ src: "/logo-192.png", sizes: "192x192" }] },
          { name: "New Task", short_name: "Task", url: "/?module=tasks&new=1", icons: [{ src: "/logo-192.png", sizes: "192x192" }] },
        ],
        categories: ["productivity", "utilities"],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2,woff}"],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        navigateFallback: "/index.html",
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api",
              networkTimeoutSeconds: 10,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/openrouter\.ai\/.*/i,
            handler: "NetworkOnly",
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    target: "es2021",
    outDir: "dist",
  },
});
