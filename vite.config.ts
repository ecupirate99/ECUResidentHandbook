import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // This is necessary to prevent the "process is not defined" error
      // It exposes the system environment variables to the browser code
      'process.env': env
    }
  }
})