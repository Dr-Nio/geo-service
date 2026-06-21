Perfect! Your code base is complete with separate build files. Now let me create the main `build.js` that orchestrates all the builds, and update the `package.json` to use the individual build files.

## 1. **build.js** (Orchestrator - Create this file)

```javascript
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
    console.log('   - FullyDynamicGeolocationService.js');
    console.log('   - CurrencyConverter.js');
    console.log('   - index.js (source copy)');

  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

build();
```

## 2. Updated **package.json** (with build scripts)

```json
{
  "name": "@dr-nio/geo-service",
  "version": "3.0.2",
  "description": "Zero-hardcode geolocation & currency service with dynamic API discovery, real-time conversion, and Intl-based localization",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "browser": "dist/index.browser.js",
  "types": "src/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "browser": "./dist/index.browser.js",
      "default": "./dist/index.js"
    },
    "./package.json": "./package.json"
  },
  "files": [
    "dist",
    "src",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "node build.js",
    "build:cjs": "node build.cjs.js",
    "build:esm": "node build.esm.js",
    "build:browser": "node build.browser.js",
    "prepublishOnly": "npm run build",
    "test": "node test-simple.js",
    "example": "node example.js",
    "clean": "rm -rf dist",
    "prebuild": "npm run clean"
  },
  "keywords": [
    "geolocation",
    "ip",
    "address",
    "country",
    "currency",
    "conversion",
    "exchange-rate",
    "locale",
    "dynamic",
    "browser",
    "intl",
    "zero-hardcode",
    "rate",
    "money",
    "seo",
    "dollar",
    "pounds",
    "euro",
    "forex",
    "finance",
    "localization",
    "i18n"
  ],
  "author": "Nicholas Oscar Okechukwu",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/Dr-Nio/geo-service"
  },
  "bugs": {
    "url": "https://github.com/Dr-Nio/geo-service/issues"
  },
  "homepage": "https://github.com/Dr-Nio/geo-service#readme",
  "engines": {
    "node": ">=14.0.0"
  },
  "devDependencies": {
    "esbuild": "^0.28.1"
  }
}
```

## 3. **test-simple.js** (Test File)

```javascript
import FullyDynamicGeolocationService from './src/index.js';

console.log('🧪 TESTING DYNAMIC GEOLOCATION SERVICE\n');
console.log('='.repeat(50) + '\n');

const service = new FullyDynamicGeolocationService();

async function runTests() {
  try {
    // Test 1: Browser Capabilities
    console.log('📡 Test 1: Browser Capabilities');
    const capabilities = service.getBrowserCapabilities();
    console.log(`✅ Has Intl: ${capabilities.hasIntl}`);
    console.log(`✅ Has Fetch: ${capabilities.hasFetch}`);
    console.log(`✅ Has Navigator: ${capabilities.hasNavigator}`);
    console.log(`✅ Has Geolocation: ${capabilities.hasGeolocation}`);
    console.log(`✅ Timezone: ${capabilities.timezone || 'Unknown'}`);
    console.log(`✅ Languages: ${capabilities.languages.join(', ')}`);
    console.log('');

    // Test 2: Get Location
    console.log('📍 Test 2: Getting Location...');
    const location = await service.getUserLocation();
    console.log(`✅ Location: ${location.location || 'Unknown'}`);
    console.log(`✅ Country Code: ${location.countryCode || 'Unknown'}`);
    console.log(`✅ City: ${location.city || 'Unknown'}`);
    console.log(`✅ Region: ${location.region || 'Unknown'}`);
    console.log(`✅ IP: ${location.ip || 'Unknown'}`);
    console.log(`✅ Timezone: ${location.timezone || 'Unknown'}`);
    console.log('');

    // Test 3: Currency Information
    console.log('💰 Test 3: Currency Information');
    console.log(`✅ Code: ${location.currency.code}`);
    console.log(`✅ Symbol: ${location.currency.symbol} (via ${location.currency.symbolMethod})`);
    console.log(`✅ Name: ${location.currency.name} (via ${location.currency.nameMethod})`);
    console.log('');

    // Test 4: Currency Conversion
    console.log('💱 Test 4: Currency Conversion');
    const conversion = await service.convertCurrency(100, 'USD', 'EUR');
    console.log(`✅ 100 USD = ${conversion.convertedAmount.toFixed(2)} EUR`);
    console.log(`✅ Rate: 1 USD = ${conversion.rate} EUR`);
    console.log('');

    // Test 5: Available Currencies
    console.log('🌐 Test 5: Available Currencies');
    const currencies = await service.getAvailableCurrencies();
    console.log(`✅ Found ${currencies.length} currencies`);
    console.log(`✅ Sample: ${currencies.slice(0, 10).join(', ')}...`);
    console.log('');

    // Test 6: Format Currency
    console.log('💲 Test 6: Format Currency');
    const formatted = await service.formatCurrency(1234.56, 'EUR', 'fr-FR');
    console.log(`✅ Formatted: ${formatted}`);
    console.log('');

    // Test 7: Multiple Conversions
    console.log('💱 Test 7: Multiple Conversions');
    const targets = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
    const multi = await service.convertToMultiple(1000, 'USD', targets);
    console.log('✅ Results:');
    for (const [currency, result] of Object.entries(multi.conversions)) {
      if (result) {
        console.log(`   ${currency}: ${result.convertedAmount.toFixed(2)} (rate: ${result.rate})`);
      }
    }
    console.log('');

    // Test 8: Cache Stats
    console.log('📊 Test 8: Cache Statistics');
    const stats = service.getCurrencyCacheStats();
    console.log(`✅ ${stats.size} cached rates`);

    console.log('\n🎉 All tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

runTests();
```

## 4. **example.js** (Complete Example)

```javascript
import FullyDynamicGeolocationService from './src/index.js';

console.log('🚀 DYNAMIC GEOLOCATION SERVICE EXAMPLE\n');
console.log('='.repeat(50) + '\n');

const service = new FullyDynamicGeolocationService();

async function main() {
  try {
    // Step 1: Get location
    console.log('📍 Step 1: Getting your location...');
    const location = await service.getUserLocation();
    service.displayLocationInfo(location);

    console.log('\n' + '='.repeat(50) + '\n');

    // Step 2: Currency conversion
    console.log('💱 Step 2: Currency Conversion');
    console.log(`Converting 100 USD to ${location.currency.code}...`);
    const conversion = await service.convertCurrency(100, 'USD', location.currency.code);
    service.displayConversion(conversion);

    console.log('\n' + '='.repeat(50) + '\n');

    // Step 3: Multiple currency conversion
    console.log('💱 Step 3: Multiple Currency Conversion');
    console.log('Converting 1000 USD to multiple currencies...');
    const targets = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
    const multi = await service.convertToMultiple(1000, 'USD', targets);
    service.displayMultipleConversions(multi);

    console.log('\n' + '='.repeat(50) + '\n');

    // Step 4: Available currencies
    console.log('🌐 Step 4: Available Currencies');
    const currencies = await service.getAvailableCurrencies();
    console.log(`Found ${currencies.length} currencies`);
    console.log(`First 20: ${currencies.slice(0, 20).join(', ')}...`);

    console.log('\n' + '='.repeat(50) + '\n');

    // Step 5: Format currency
    console.log('💲 Step 5: Currency Formatting');
    const formats = [
      { amount: 1234.56, currency: 'USD', locale: 'en-US' },
      { amount: 1234.56, currency: 'EUR', locale: 'fr-FR' },
      { amount: 1234.56, currency: 'JPY', locale: 'ja-JP' },
      { amount: 1234.56, currency: 'GBP', locale: 'en-GB' },
      { amount: 1234.56, currency: 'INR', locale: 'en-IN' }
    ];
    
    for (const f of formats) {
      const formatted = await service.formatCurrency(f.amount, f.currency, f.locale);
      console.log(`  ${f.locale} (${f.currency}): ${formatted}`);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Step 6: Cache stats
    console.log('📊 Step 6: Cache Statistics');
    const stats = service.getCurrencyCacheStats();
    console.log(`Cached rates: ${stats.size}`);
    if (stats.entries.length > 0) {
      console.log('Sample entries:');
      stats.entries.slice(0, 3).forEach(entry => {
        console.log(`  ${entry.key}: ${entry.rate} (${entry.age})`);
      });
    }

    console.log('\n🎉 Example completed successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

main();
```

## 5. **src/index.d.ts** (TypeScript Definitions)

```typescript
// TypeScript definitions for @dr-nio/geo-service

export interface LocationData {
  location: string | null;
  countryCode: string | null;
  city: string | null;
  region: string | null;
  ip: string | null;
  timezone: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
}

export interface CurrencyData {
  code: string;
  symbol: string;
  symbolMethod: string;
  name: string;
  nameMethod: string;
  exchangeRates: Record<string, number>;
  baseCurrency: string;
}

export interface LocaleData {
  preferred: string;
  available: string[];
  browser: string[];
  timezone: string | null;
  system: string;
}

export interface LocationResult {
  location: string | null;
  countryCode: string | null;
  city: string | null;
  region: string | null;
  ip: string | null;
  timezone: string | null;
  latitude: number | string | null;
  longitude: number | string | null;
  currency: CurrencyData;
  countryDetails: any;
  locale: LocaleData;
  raw: {
    geo: any;
    currency: any;
    country: any;
  };
  meta: {
    geoAPI: {
      url: string;
      dataKeys: string[];
    };
    browserCapabilities: BrowserCapabilities;
    timestamp: string;
  };
}

export interface BrowserCapabilities {
  hasIntl: boolean;
  hasNumberFormat: boolean;
  hasDisplayNames: boolean;
  hasListFormat: boolean;
  hasRelativeTimeFormat: boolean;
  hasFetch: boolean;
  hasNavigator: boolean;
  hasGeolocation: boolean;
  availableLocales: string[];
  timezone: string | null;
  languages: string[];
  platform: PlatformInfo;
}

export interface PlatformInfo {
  userAgent?: string;
  platform?: string;
  vendor?: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  maxTouchPoints?: number;
}

export interface ConversionResult {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  convertedAmount: number;
  timestamp: string;
}

export interface MultiConversionResult {
  amount: number;
  fromCurrency: string;
  conversions: Record<string, ConversionResult | null>;
  timestamp: string;
}

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  locale: string | null;
}

export interface HistoricalRateResult {
  rate: number;
  date: string;
  fromCurrency: string;
  toCurrency: string;
  timestamp: string;
  source: string;
}

export interface CacheStats {
  size: number;
  keys: string[];
  entries: Array<{
    key: string;
    rate: number;
    age: string;
  }>;
}

export declare class FullyDynamicGeolocationService {
  constructor();
  
  // Browser capabilities
  detectBrowserCapabilities(): BrowserCapabilities;
  getBrowserCapabilities(): BrowserCapabilities;
  getAvailableLocales(): string[];
  getBrowserTimezone(): string | null;
  getBrowserLanguages(): string[];
  getPlatformInfo(): PlatformInfo;
  
  // Geolocation
  discoverGeolocationAPI(): Promise<any>;
  getUserLocation(): Promise<LocationResult>;
  extractData(obj: any, keys: string[]): any;
  displayLocationInfo(locationInfo: LocationResult): void;
  
  // Currency
  getDynamicCurrencySymbol(currencyCode: string, locale?: string | null): Promise<{ symbol: string; method: string; locale: string }>;
  getDynamicCurrencyName(currencyCode: string, locale?: string | null): Promise<{ name: string; method: string; locale: string }>;
  
  // Currency Conversion
  convertCurrency(amount: number, fromCurrency: string, toCurrency: string, options?: any): Promise<ConversionResult>;
  getExchangeRate(fromCurrency: string, toCurrency: string, options?: any): Promise<number>;
  getAvailableCurrencies(): Promise<string[]>;
  formatCurrency(amount: number, currencyCode: string, locale?: string | null): Promise<string>;
  convertToMultiple(amount: number, fromCurrency: string, targetCurrencies: string[], options?: any): Promise<MultiConversionResult>;
  getMultipleRates(baseCurrency: string, targetCurrencies: string[], options?: any): Promise<Record<string, number>>;
  getCurrencyInfo(currencyCode: string, locale?: string | null): Promise<CurrencyInfo>;
  getHistoricalRate(fromCurrency: string, toCurrency: string, date: string, options?: any): Promise<HistoricalRateResult>;
  
  // Display
  displayConversion(result: ConversionResult): any;
  displayMultipleConversions(results: MultiConversionResult): any;
  
  // Cache
  clearAllCaches(): void;
  getCurrencyCacheStats(): CacheStats;
}

export default FullyDynamicGeolocationService;
```

## 6. **.gitignore**

```
node_modules/
dist/
*.log
*.tmp
*.temp
.DS_Store
coverage/
.env
.env.local
.env.production
npm-debug.log*
yarn-debug.log*
yarn-error.log*
```

## How to Use

### Install Dependencies
```bash
npm install
```

### Build the Package
```bash
npm run build
```

### Or Build Individual Formats
```bash
npm run build:cjs    # CommonJS only
npm run build:esm    # ESM only
npm run build:browser # Browser only
```

### Test the Package
```bash
npm test
```

### Run Example
```bash
npm run example
```

### Clean Build Files
```bash
npm run clean
```

### Publish to NPM
```bash
# Login to npm
npm login

# Publish with public access
npm publish --access public
```

## Complete File Structure

```
@dr-nio/geo-service/
├── src/
│   ├── index.js
│   ├── index.d.ts
│   ├── CurrencyConverter.js
│   └── FullyDynamicGeolocationService.js
├── dist/                    (generated by build)
│   ├── index.js            (CommonJS)
│   ├── index.mjs           (ES Module)
│   ├── index.browser.js    (Browser)
│   ├── CurrencyConverter.js
│   └── FullyDynamicGeolocationService.js
├── build.js                (orchestrator)
├── build.cjs.js           (CommonJS build)
├── build.esm.js           (ESM build)
├── build.browser.js       (Browser build)
├── test-simple.js         (Test file)
├── example.js             (Example file)
├── package.json
├── README.md
├── LICENSE
└── .gitignore
```

Your package is now fully ready for publishing! The build system creates three different formats (CommonJS, ESM, and Browser) so users can import it in any environment.
