import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  build: {
    outDir: 'dist',
    minify: 'esbuild',  // Use esbuild for faster minification
    sourcemap: false,   // Disable source maps for faster builds
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')  // Ensure this path is correct
      },
      output: {
        manualChunks: {
          // Split vendor code into separate chunks
          vendor: ['react', 'react-dom']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
  },
});



// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
