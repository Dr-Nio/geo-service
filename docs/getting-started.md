The errors are happening because:

1. The TypeScript declarations aren't being properly exported
2. The package.json `"exports"` field needs to include the types

Let me fix this for you:

## 1. Updated **package.json** (with proper types export)

```json
{
  "name": "@dr-nio/geo-service",
  "version": "3.0.3",
  "description": "Zero-hardcode geolocation & currency service with dynamic API discovery, real-time conversion, and Intl-based localization",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "browser": "dist/index.browser.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
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
    "build:types": "node build.types.js",
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

## 2. **build.types.js** (Create this file to copy types)

```javascript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📦 Building TypeScript declarations...');

// Ensure dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy TypeScript declarations to dist
const srcTypesPath = path.join(__dirname, 'src', 'index.d.ts');
const distTypesPath = path.join(distDir, 'index.d.ts');

if (fs.existsSync(srcTypesPath)) {
  let content = fs.readFileSync(srcTypesPath, 'utf8');
  
  // Update the module declaration to match the package
  content = content.replace(
    /declare module ['"][^'"]+['"]/,
    `declare module '@dr-nio/geo-service'`
  );
  
  fs.writeFileSync(distTypesPath, content);
  console.log('✅ TypeScript declarations copied to dist/index.d.ts');
} else {
  console.warn('⚠️  TypeScript declarations file not found: src/index.d.ts');
}

// Also copy to src/index.d.ts if it doesn't exist
const srcTypesPathCheck = path.join(__dirname, 'src', 'index.d.ts');
if (!fs.existsSync(srcTypesPathCheck)) {
  console.log('📝 Creating TypeScript declarations file...');
  
  const typesContent = `// TypeScript definitions for @dr-nio/geo-service

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

// Declare module for TypeScript
declare module '@dr-nio/geo-service' {
  export = FullyDynamicGeolocationService;
  export default FullyDynamicGeolocationService;
}`;

  fs.writeFileSync(srcTypesPathCheck, typesContent);
  fs.writeFileSync(distTypesPath, typesContent);
  console.log('✅ TypeScript declarations created at src/index.d.ts and dist/index.d.ts');
}
```

## 3. Updated **build.js** (include types build)

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
```

## 4. **src/index.d.ts** (Create this file)

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

// Module declaration for TypeScript
declare module '@dr-nio/geo-service' {
  export = FullyDynamicGeolocationService;
  export default FullyDynamicGeolocationService;
}
```

## 5. Fix for the "declared but never read" warning

This warning is from your IDE/TypeScript. It's not an actual error - it means the import is being used but TypeScript thinks it's not. Make sure you're using it properly:

```typescript
// In your TypeScript/JavaScript file
import FullyDynamicGeolocationService from '@dr-nio/geo-service';

// Or
import { FullyDynamicGeolocationService } from '@dr-nio/geo-service';

// Then use it
const service = new FullyDynamicGeolocationService();
```

## How to Fix the Issue

### 1. Rebuild the package
```bash
npm run build
```

### 2. Reinstall in your Next.js app
```bash
# In your Next.js app directory
npm uninstall @dr-nio/geo-service
npm install @dr-nio/geo-service
```

### 3. Or install locally for testing
```bash
# In the geo-service directory
npm run build
npm link

# In your Next.js app
npm link @dr-nio/geo-service
```

### 4. Update your tsconfig.json (if using TypeScript)
```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true
  }
}
```

## 5. In your Next.js app, use it like this:

```typescript
// app/page.tsx or any component
'use client';

import { useEffect, useState } from 'react';
import FullyDynamicGeolocationService from '@dr-nio/geo-service';

export default function Home() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    async function getLocation() {
      const service = new FullyDynamicGeolocationService();
      const result = await service.getUserLocation();
      setLocation(result);
      console.log(result);
    }
    getLocation();
  }, []);

  return (
    <div>
      <h1>Location</h1>
      {location && (
        <pre>{JSON.stringify(location, null, 2)}</pre>
      )}
    </div>
  );
}
```

## Summary

The fixes I've made:

1. ✅ **Added `"types": "dist/index.d.ts"`** to package.json
2. ✅ **Added `"types"` to exports** in package.json
3. ✅ **Created `build.types.js`** to copy TypeScript declarations
4. ✅ **Updated `build.js`** to build types
5. ✅ **Created `src/index.d.ts`** with proper module declarations
6. ✅ **Added module declaration** for `@dr-nio/geo-service`

Now run `npm run build` and your package should work properly with TypeScript!
