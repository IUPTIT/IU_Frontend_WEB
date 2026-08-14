import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // load tat ca bien trong .env (ke ca bien khong co prefix VITE_) + process.env
  const env = loadEnv(mode, process.cwd(), '')
  const devPort = Number(env.DEV_PORT) || 5173
  const webPort = Number(env.WEB_PORT) || 6666

  return {
    plugins: [react()],
    build: {
      // Chunk lon nhat la PortalApp (~1MB, khu quan tri sau dang nhap) — chap nhan duoc
      chunkSizeWarningLimit: 1100,
    },
    server: {
      host: true,
      port: devPort,
      allowedHosts: ['portal.iuptit.com'],
    },
    preview: {
      host: true,
      port: webPort,
      allowedHosts: ['portal.iuptit.com'],
    },
  }
})
