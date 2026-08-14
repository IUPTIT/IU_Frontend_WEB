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
    server: {
      host: true,
      port: devPort,
    },
    preview: {
      host: true,
      port: webPort,
    },
  }
})
