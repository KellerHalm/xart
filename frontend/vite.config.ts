import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: [
        "images/icons/xart.svg",
        "images/icons/apple-touch-icon.png",
        "images/icons/icon-16x16.png",
        "images/icons/icon-32x32.png",
        "images/icons/icon-96x96.png",
        "images/icons/icon-128x128.png",
        "images/icons/icon-144x144.png",
        "images/icons/icon-152x152.png",
        "images/icons/icon-192x192.png",
        "images/icons/icon-384x384.png",
        "images/icons/icon-512x512.png",
        "images/splash/*.png",
      ],
      manifest: {
        name: "Xart",
        short_name: "Xart",
        description: "Xart web application.",
        lang: "ru",
        dir: "ltr",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#1b1d1f",
        theme_color: "#1b1d1f",
        icons: [
          {
            src: "/images/icons/icon-72x72.png",
            sizes: "72x72",
            type: "image/png",
          },
          {
            src: "/images/icons/icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
          {
            src: "/images/icons/icon-128x128.png",
            sizes: "128x128",
            type: "image/png",
          },
          {
            src: "/images/icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "/images/icons/icon-152x152.png",
            sizes: "152x152",
            type: "image/png",
          },
          {
            src: "/images/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/images/icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "/images/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest,woff2}"],
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "#": path.resolve(__dirname, "src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("vue") || id.includes("pinia") || id.includes("vue-router")) {
              return "framework";
            }
            if (id.includes("swiper")) return "swiper";
            if (id.includes("markdown-it")) return "markdown";
            if (id.includes("cropperjs")) return "cropper";
            return "vendor";
          }
          return undefined;
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
});
