import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    server: {
        proxy: {
            // Proxy API requests to the Nginx Docker container (mapped to port 80)
            '/api': {
                target: 'http://localhost:80',
                changeOrigin: true,
                secure: false,
            }
        }
    }
})