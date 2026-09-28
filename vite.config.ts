import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'node:fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    define: { __AKSHIGO_TEST_BUILD__: JSON.stringify(process.env.AKSHIGO_TEST_BUILD === '1') },
    plugins: [react(), tailwindcss(), {
      name: 'test-build-license-inventory',
      generateBundle(_options, bundle) {
        if (process.env.AKSHIGO_TEST_BUILD !== '1') return;
        const inputs = Object.fromEntries(Object.values(bundle).flatMap(item => item.type === 'chunk' ? Object.keys(item.modules) : [])
          .map(file => [path.relative(process.cwd(), file).replaceAll('\\', '/'), {}]));
        fs.mkdirSync('build', { recursive: true });
        fs.writeFileSync('build/frontend-meta.json', JSON.stringify({ inputs }));
      }
    }],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
