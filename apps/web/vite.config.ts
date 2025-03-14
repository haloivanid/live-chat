import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsConfigPaths from 'vite-tsconfig-paths';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tsConfigPaths(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: Number(loadEnv(mode, process.cwd(), '').WEB_PORT || 5137),
    proxy: {
      '/api': {
        target: loadEnv(mode, process.cwd(), '').VITE_API_URL,
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, ''),
      },
    },
  },
}));
