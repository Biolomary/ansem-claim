import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // babel: {
      //   plugins: [['babel-plugin-react-compiler']],
      // },
    }),],
  define: {
    'process.env': process.env
  },
  resolve: {
    alias: {
      'recharts': 'recharts'
    }
  },
  optimizeDeps: {
    include: ['recharts']
  },
  build: {
    commonjsOptions: {
      include: [/recharts/, /node_modules/]
    }
  }
})