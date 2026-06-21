import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔨 Building @dr-nio/geo-service...\n');

async function build() {
  try {
    // Ensure dist directory exists
    const distDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    // Run individual build scripts
    console.log('📦 Building CommonJS version...');
    await execAsync('node build.cjs.js');
    
    console.log('📦 Building ESM version...');
    await execAsync('node build.esm.js');
    
    console.log('📦 Building Browser version...');
    await execAsync('node build.browser.js');

    // Build TypeScript declarations
    console.log('📦 Building TypeScript declarations...');
    await execAsync('node build.types.js');

    // Copy source files to dist for direct imports (optional)
    console.log('📦 Copying source files...');
    const srcFiles = [
      'FullyDynamicGeolocationService.js',
      'CurrencyConverter.js',
      'index.js'
    ];
    
    for (const file of srcFiles) {
      const srcPath = path.join(__dirname, 'src', file);
      const destPath = path.join(distDir, file);
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`   ✅ Copied ${file}`);
      }
    }

    console.log('\n🎉 Build complete!');
    console.log('📁 Output directory: dist/');
    console.log('   - index.js (CommonJS)');
    console.log('   - index.mjs (ES Module)');
    console.log('   - index.browser.js (Browser)');
    console.log('   - index.d.ts (TypeScript declarations)');
    console.log('   - FullyDynamicGeolocationService.js');
    console.log('   - CurrencyConverter.js');
    console.log('   - index.js (source copy)');

  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

build();
