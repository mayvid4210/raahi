import {defineConfig} from 'vite';
import tailwindcss from '@tailwindcss/vite';
import {VitePWA} from 'vite-plugin-pwa';
export default defineConfig({plugins:[tailwindcss(),VitePWA({registerType:'autoUpdate',includeAssets:['icon.svg','icon-192.png','icon-512.png'],manifest:{name:'Raahi — Learning to livelihood',short_name:'Raahi',theme_color:'#285c45',background_color:'#fbf9f3',display:'standalone',start_url:'/',icons:[{src:'/icon-192.png',sizes:'192x192',type:'image/png'},{src:'/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any maskable'}]},workbox:{globPatterns:['**/*.{js,css,html,svg,png}'],navigateFallback:'/index.html'}})]});
