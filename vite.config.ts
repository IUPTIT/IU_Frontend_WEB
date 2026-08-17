import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const devPort = Number(env.DEV_PORT) || 5173;
  const webPort = Number(env.WEB_PORT) || 4173;

  return {
    plugins: [
      react(),
      {
        name: "strip-async-css-from-index",
        transformIndexHtml(html) {
          return html.replace(/<link rel="stylesheet"[^>]*href="[^"]*forms-[^"]+"[^>]*>\s*/g, "");
        },
      },
    ],
    server: {
      host: true,
      port: devPort,
    },
    preview: {
      host: true,
      port: webPort,
    },
    build: {
      cssCodeSplit: true,
      modulePreload: {
        polyfill: false,
        resolveDependencies: (_filename, deps) =>
          deps.filter(
            (dep) =>
              !/forms-|xlsx-|table-|AdminPortal|Recruitment-|Lookup-|AboutClub|DaoTao|SuKien-|Login-|ResetPassword/.test(
                dep,
              ),
          ),
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/scheduler')) {
              return 'react'
            }
            if (id.includes('node_modules/react/')) return 'react'
            if (id.includes('node_modules/react-router')) return 'router'
            if (id.includes('node_modules/lucide-react')) return 'icons'
            if (id.includes('node_modules/xlsx')) return 'xlsx'
            if (id.includes('node_modules/react-select') || id.includes('node_modules/react-datepicker')) {
              return 'forms'
            }
            if (id.includes('node_modules/@tanstack')) return 'table'
          },
        },
      },
    },
  }
})
