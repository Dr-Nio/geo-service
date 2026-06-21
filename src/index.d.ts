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
