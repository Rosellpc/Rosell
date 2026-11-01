import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  devToolbar: { enabled: false },
  integrations: [{
    name: 'isolated-vite-cache',
    hooks: {
      'astro:config:setup': ({ command, updateConfig }) => {
        // Checks and builds must not replace a running dev server's optimized dependencies.
        updateConfig({ vite: { cacheDir: `node_modules/.vite-${command}` } });
      },
    },
  }],
  vite: {
    optimizeDeps: { include: ['three', 'three/addons/controls/OrbitControls.js'] },
  },
});
