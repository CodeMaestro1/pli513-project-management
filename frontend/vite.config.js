import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],

    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    
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