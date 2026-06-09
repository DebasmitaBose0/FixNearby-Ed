import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite Configuration — Manual Chunk Splitting
 *
 * ## Problem
 * Without manual chunk configuration, Vite bundles all node_modules into a
 * single large vendor chunk.  On the FixNearby client this includes React,
 * React Router, Lucide, and potentially other libraries — all shipped together
 * even when the user only needs one.  A single 500 KB+ bundle hurts:
 *
 *   - Time-to-Interactive on first load (everything must parse before React
 *     renders).
 *   - Cache efficiency: any dependency update busts the entire bundle.
 *
 * ## Solution
 * `manualChunks` maps module IDs to named chunk files that Vite produces
 * separately.  Browsers can then:
 *   1. Cache each chunk independently — a React Router update only busts
 *      that chunk, not the React core chunk.
 *   2. Parallelize chunk downloads over HTTP/2.
 *
 * ## Chunk Strategy
 *
 * | Chunk name    | Contents                                           |
 * |---------------|----------------------------------------------------|
 * | react-core    | react, react-dom, scheduler (React runtime)        |
 * | react-router  | react-router-dom, react-router (routing)           |
 * | ui-icons      | lucide-react (icon library — large, rarely changes)|
 *
 * Pages are already lazy-loaded in App.jsx via React.lazy() + Suspense, so
 * each page automatically becomes its own dynamic chunk.  This configuration
 * only affects shared dependency ("vendor") splitting.
 *
 * ## How to verify
 * Run `npm run build` in the client directory and inspect `dist/assets/`:
 * you should see separate files like:
 *   react-core-[hash].js
 *   react-router-[hash].js
 *   ui-icons-[hash].js
 *   index-[hash].js   ← application code only
 */

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  build: {
    rollupOptions: {
      output: {
        /**
         * Split vendor modules into named, cacheable chunks.
         *
         * @param {string} id - The resolved module ID (file path or package name).
         * @returns {string | undefined} Chunk name, or undefined to use Vite's default.
         */
        manualChunks(id) {
          // React runtime — core rendering engine.
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'react-core';
          }

          // React Router — routing layer.
          if (id.includes('node_modules/react-router') ||
              id.includes('node_modules/@remix-run/')) {
            return 'react-router';
          }

          // Lucide icon library — large icon set, rarely updated.
          if (id.includes('node_modules/lucide-react')) {
            return 'ui-icons';
          }

          // All remaining node_modules fall into a single 'vendor' chunk.
          // This is safer than splitting every package individually, which
          // can cause excessive HTTP requests for small modules.
          if (id.includes('node_modules/')) {
            return 'vendor';
          }

          // Application code uses Vite's default chunking (per dynamic import).
        },
      },
    },
  },
});
