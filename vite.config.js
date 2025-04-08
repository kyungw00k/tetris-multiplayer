import { defineConfig } from 'vite';

export default defineConfig({
  base: '/tetris-multiplayer/',
  server: {
    host: true, // 로컬 네트워크 연결을 위해 0.0.0.0에 바인딩
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  }
}); 
