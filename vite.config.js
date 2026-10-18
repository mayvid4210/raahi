import {defineConfig,loadEnv} from 'vite';
import onboarding from './api/onboarding.js';
import tailwindcss from '@tailwindcss/vite';
import {VitePWA} from 'vite-plugin-pwa';
// Run the same server-only Vercel handler during local Vite development.
const localOnboarding = {
  name: 'local-onboarding',
  configureServer(server) {
    const env = loadEnv(server.config.mode, process.cwd(), 'GEMINI_');
    if (!process.env.GEMINI_API_KEY && env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
    server.middlewares.use((req, res, next) => {
      if (req.url?.split('?')[0] === '/api/onboarding') onboarding(req, res);
      else next();
    });
  },
};
export default defineConfig({plugins:[localOnboarding,tailwindcss(),VitePWA({registerType:'autoUpdate',includeAssets:['icon.svg','icon-192.png','icon-512.png'],manifest:{name:'Raahi — Learning to livelihood',short_name:'Raahi',theme_color:'#285c45',background_color:'#fbf9f3',display:'standalone',start_url:'/',icons:[{src:'/icon-192.png',sizes:'192x192',type:'image/png'},{src:'/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any maskable'}]},workbox:{globPatterns:['**/*.{js,css,html,svg,png}'],navigateFallback:'/index.html',navigateFallbackDenylist:[/^\/api(?:\/|$)/]}})]});
