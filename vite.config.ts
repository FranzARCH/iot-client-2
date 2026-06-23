import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const esp32Host = env.VITE_ESP32CAM_HOST || '192.168.1.120'

  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: true,
      proxy: {
        '/esp32cam-stream': {
          target: `http://${esp32Host}:81`,
          changeOrigin: true,
          rewrite: () => '/stream',
        },
        '/esp32cam-capture': {
          target: `http://${esp32Host}`,
          changeOrigin: true,
          rewrite: () => '/capture',
        },
      },
    },
  }
})
