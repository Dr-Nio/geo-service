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
