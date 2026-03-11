import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vite Configuration for NIET Weather Station
 *
 * Development Mode:
 * - Use mock data: VITE_USE_MOCK_DATA=true npm run dev
 * - Use Netlify Dev: netlify dev
 * - Use backend server: npm run dev (with server running on port 3002)
 */

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');

  // Determine proxy target based on environment
  const getProxyTarget = () => {
    // Allow override via environment variable
    if (env.VITE_DEV_API_PROXY_TARGET) {
      console.log(`[vite] Using API proxy target: ${env.VITE_DEV_API_PROXY_TARGET}`);
      return env.VITE_DEV_API_PROXY_TARGET;
    }

    // Default: Try backend server first, then Netlify Dev
    const useBackend = env.VITE_USE_BACKEND === 'true';
    const target = useBackend ? 'http://localhost:3002' : 'http://localhost:8888';
    console.log(`[vite] VITE_USE_BACKEND=${useBackend}, using proxy target: ${target}`);
    return target;
  };

  const proxyTarget = getProxyTarget();

  return {
    plugins: [react()],
    base: '/',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    server: {
      port: 5173,
      strictPort: false,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          // Rewrite path for Netlify Functions or Local Backend
          rewrite: (path) => {
            // If proxying to Netlify Dev (port 8888), rewrite to /.netlify/functions/sensorData
            if (proxyTarget.includes('8888')) {
              return path.replace(/^\/api/, '/.netlify/functions/sensorData');
            }
            // If proxying to local backend server (port 3002), rewrite to /api/sensor-data
            if (proxyTarget.includes('3002')) {
              return path.replace(/^\/api/, '/api/sensor-data');
            }
            // Default: Keep as is
            return path;
          },
          // Enhanced error handling
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.error('[Proxy Error]', {
                url: req.url,
                target: proxyTarget,
                error: err.message,
              });

              // Return helpful error response
              res.writeHead(503, {
                'Content-Type': 'application/json',
              });
              res.end(
                JSON.stringify({
                  error: 'Development server connection failed',
                  details: `Could not reach ${proxyTarget}`,
                  solution: 'Try one of these: \n' +
                    '1. Start backend: npm run dev (in this terminal)\n' +
                    '2. Use mock data: VITE_USE_MOCK_DATA=true npm run dev\n' +
                    '3. Start Netlify Dev: netlify dev',
                })
              );
            });
          },
        },
      },
    },
    preview: {
      port: 5173,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
