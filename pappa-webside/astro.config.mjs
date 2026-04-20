// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  site: 'https://trondknutli.no',
  trailingSlash: 'ignore',
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      cssCodeSplit: false,
    },
    // Serve /admin → /admin/index.html in dev mode
    plugins: [{
      name: 'admin-redirect',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Redirect /admin → /admin/ so relative paths (config.yml) resolve correctly
          if (req.url === '/admin') {
            res.writeHead(302, { Location: '/admin/' });
            res.end();
            return;
          }
          if (req.url === '/admin/') {
            req.url = '/admin/index.html';
          }
          next();
        });
      },
    }],
  },
});
