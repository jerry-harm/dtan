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
    // 1. 开启代码压缩（默认开启，显式配置确保低带宽场景生效）
    minify: 'terser', // esbuild 压缩速度比 terser 快，体积略小；需极致压缩可换 'terser'
    terserOptions: { // 若用 terser，可进一步配置（如移除 console）
      compress: {
        drop_console: true, // 移除 console.log（非必要日志）
        drop_debugger: true, // 移除 debugger
      },
    },

    // 2. 开启 Tree-Shaking（默认开启，确保生产环境生效）
    // Tree-Shaking 会移除未使用的代码（如未引用的函数、组件）
    emptyOutDir: true, // 清空输出目录，避免冗余文件

    // 3. 控制 chunk 体积（避免单个文件过大，也避免过小导致请求过多）
    chunkSizeWarningLimit: 200, // chunk 体积超过 200kb 时报警（可根据需求调整）
    rollupOptions: {
      output: {
        inlineDynamicImports: false, // 关闭动态导入内联（避免主 chunk 过大）
        // 6. 开启 gzip/brotli 压缩（关键！低带宽场景体积减少 60%-80%）
        compact: true,
      },
    },
  },  
});
