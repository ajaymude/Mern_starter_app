import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(
      process.env.VITE_PORT || import.meta.env.VITE_PORT || "3000",
      10
    ),
    proxy: {
      "/api": {
        target:
          process.env.VITE_API_TARGET ||
          import.meta.env.VITE_API_TARGET ||
          "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket proxying
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            // eslint-disable-next-line no-console
            console.error("Proxy error:", err);
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            // eslint-disable-next-line no-console
            console.log("Proxying request:", req.method, req.url);
          });
        },
      },
    },
  },
  build: {
    outDir: "build",
    // Optimize for production
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "redux-vendor": ["@reduxjs/toolkit", "react-redux"],
          "ui-vendor": ["tailwindcss"],
        },
        // Optimize chunk file names
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Source maps for production debugging (optional)
    sourcemap: false, // Set to true if you need source maps
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "@reduxjs/toolkit"],
  },
});
