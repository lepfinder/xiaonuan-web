import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // 官网是静态落地页：支持新版生活长卷 index.html 与经典版 classic.html 双入口
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        classic: resolve(__dirname, 'classic.html'),
      },
    },
  },
})
