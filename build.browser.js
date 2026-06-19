import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { build } from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build browser version with esbuild
await build({
  entryPoints: ['src/index.js'],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ['chrome90', 'firefox90', 'safari15', 'edge90'],
  outfile: 'dist/index.browser.js',
  format: 'iife',
  globalName: 'GeoService',
  platform: 'browser',
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});

console.log('✅ Browser build created: dist/index.browser.js (minified)');
