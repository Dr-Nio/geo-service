import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the source file
const sourcePath = path.join(__dirname, 'src', 'FullyDynamicGeolocationService.js');
const source = fs.readFileSync(sourcePath, 'utf8');

// Create CommonJS version
const cjsContent = `
// CommonJS build
'use strict';

${source.replace('export default FullyDynamicGeolocationService;', '')}

// Export for CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FullyDynamicGeolocationService;
  module.exports.FullyDynamicGeolocationService = FullyDynamicGeolocationService;
}
`;

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Write CommonJS file
fs.writeFileSync(path.join(distDir, 'index.js'), cjsContent);
console.log('✅ CommonJS build created: dist/index.js');
