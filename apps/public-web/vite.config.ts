import path from 'node:path'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
  // The shared-types/shared-utils workspace packages compile to CommonJS, but npm workspace
  // linking exposes them via a symlink Vite resolves to their real (non-node_modules) path —
  // which skips the automatic CJS->ESM interop it normally applies to node_modules deps.
  // Forcing them into optimizeDeps re-applies that interop so `import { x } from "@district-one/..."`
  // resolves correctly in the browser instead of throwing "does not provide an export named ...".
  optimizeDeps: {
    include: ['@district-one/shared-types', '@district-one/shared-utils'],
  },
})
