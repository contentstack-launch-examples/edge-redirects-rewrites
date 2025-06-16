import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['lib/**/*.js', 'functions/**/*.js'],
      exclude: ['tests/**', 'node_modules/**']
    }
  },
  resolve: {
    alias: {
      '@': new URL('./', import.meta.url).pathname
    }
  },
  plugins: [],
  css: false,
  esbuild: {
    target: 'node18'
  },
  server: {
    watch: {
      ignored: ['**/postcss.config.*', '**/tailwind.config.*']
    }
  }
});
