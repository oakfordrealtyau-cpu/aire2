import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";


// Eto po ay for build production, mas optimize ang build settings saka secured, kaya for keep lang po ito.


export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    port: 8080,
    open: true,
    strictPort: true,
    // Proxy API requests to the local backend so cookies are treated as first‑party
    // during development (no cross-site cookie/SameSite issues).
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // rewrite Set-Cookie header domain attribute so cookies issued by
        // localhost:5000 become valid for localhost:8080.  Without this the
        // browser ignores the cookie because it doesn't match the current
        // host.
        cookieDomainRewrite: {
          // empty string removes domain attribute completely
          "localhost": "",
          "localhost:5000": "",
        },
      },
    },
  },
  build: {
    cssCodeSplit: true,
    minify: "esbuild",
    sourcemap: false,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 600,
    esbuild: {
      drop: ["console", "debugger"],
      legalComments: "none",
      treeShaking: true,
    },
rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
        manualChunks: {
          vendor: ["react", "react-dom"],
        },
      },
    },
  },
  preview: {
    port: 8080,
    strictPort: true,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});
