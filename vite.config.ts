import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: 'VisaFreeList AI',
          short_name: 'VisaAI',
          description: 'Cyberpunk Visa Requirement Checker & Passport Analyzer',
          theme_color: '#020204',
          background_color: '#020204',
          display: 'standalone',
          orientation: 'portrait',
          start_url: './',
          scope: './',
          icons: [
            {
              src: 'https://pic.wildsalt.me/storage/img/logo/visafree-png-1767321905722-7084.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'https://pic.wildsalt.me/storage/img/logo/visafree-png-1767321905722-7084.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        },
        workbox: {
          // Optimization: Don't cache the external image in SW to avoid CORS issues if not configured,
          // but cache local JS/CSS/HTML for offline shell.
          globPatterns: ['**/*.{js,css,html,ico,png,svg}']
        }
      })
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
    server: {
      port: 3000,
    }
  };
});