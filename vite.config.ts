import { defineConfig, searchForWorkspaceRoot } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import  viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: false,
        type: "module",
      },
    }),
    viteCompression({
      algorithm: 'gzip',
      threshold: 10240,
      deleteOriginFile: false,
      ext: '.gz',
    }),
  ],
  server: {
    fs: {
      strict: false,
    },
  },
  worker: {
    format: "es",
  },
    build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    emptyOutDir: true,

    chunkSizeWarningLimit: 200,
    rollupOptions: {
      output: {
        inlineDynamicImports: false,
        compact: true,
      },
    },
  },  
});
