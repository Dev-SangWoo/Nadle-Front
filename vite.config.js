import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = String(env.VITE_API_BASE_URL || 'https://nadle-backend.onrender.com').replace(
    /\/+$/,
    ''
  )

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    /**
     * 로컬(http://localhost:5173)에서 Render 등 외부 API를 직접 호출하면 CORS에 막힘.
     * /api 로 오는 요청만 개발 서버가 백엔드로 넘겨서 같은 출처처럼 동작하게 함.
     */
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: true,
          /** Render cold start·느린 응답 시 기본 타임아웃으로 502 나는 경우 완화 */
          timeout: 180_000,
          proxyTimeout: 180_000,
          configure(proxy) {
            proxy.on('error', (err) => {
              console.error('[vite proxy /api]', err?.message || err)
            })
          }
        }
      }
    }
  }
})
