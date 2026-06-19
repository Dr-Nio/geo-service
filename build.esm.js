import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the source file
const sourcePath = path.join(__dirname, 'src', 'FullyDynamicGeolocationService.js');
let source = fs.readFileSync(sourcePath, 'utf8');

// Remove the export if it exists (we'll add our own)
source = source.replace(/export\s+default\s+FullyDynamicGeolocationService\s*;?/, '');

// Create ESM version
const esmContent = `
// ESM build
${source}

// Export for ESM
export default FullyDynamicGeolocationService;
export { FullyDynamicGeolocationService };
`;

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Write ESM file
fs.writeFileSync(path.join(distDir, 'index.mjs'), esmContent);
console.log('✅ ESM build created: dist/index.mjs');
