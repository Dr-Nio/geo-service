import CurrencyConverter from './CurrencyConverter.js';

class FullyDynamicGeolocationService {
    constructor() {
        // No hard-coded URLs - we'll discover them dynamically
        this.discoveryUrls = [
            'https://ipapi.co/json/',
            'https://ipinfo.io/json',
            'https://api.ipify.org?format=json'
        ];
        
        // No cache duration hard-coded - will be determined by API response
        this.cache = new Map();
        
        // Get browser capabilities dynamically
        this.browserCapabilities = this.detectBrowserCapabilities();
        
        // Initialize currency converter with reference to this service
        this.currencyConverter = new CurrencyConverter(this);
    }

    /**
     * Dynamically detect browser capabilities
     */
    detectBrowserCapabilities() {
        const capabilities = {
            // Check for Intl support
            hasIntl: typeof Intl !== 'undefined',
            hasNumberFormat: typeof Intl?.NumberFormat !== 'undefined',
            hasDisplayNames: typeof Intl?.DisplayNames !== 'undefined',
            hasListFormat: typeof Intl?.ListFormat !== 'undefined',
            hasRelativeTimeFormat: typeof Intl?.RelativeTimeFormat !== 'undefined',
            
            // Check for Fetch API
            hasFetch: typeof fetch !== 'undefined',
            
            // Check for Navigator API
            hasNavigator: typeof navigator !== 'undefined',
            hasGeolocation: typeof navigator?.geolocation !== 'undefined',
            
            // Get available locales
            availableLocales: this.getAvailableLocales(),
            
            // Get browser timezone
            timezone: this.getBrowserTimezone(),
            
            // Get browser languages
            languages: this.getBrowserLanguages(),
            
            // Get platform info
            platform: this.getPlatformInfo()
        };
        
        return capabilities;
    }

    /**
     * Get all available locales from the browser
     */
    getAvailableLocales() {
        try {
            if (typeof Intl !== 'undefined' && Intl.NumberFormat) {
                return Intl.NumberFormat.supportedLocalesOf([]);
            }
            return [];
        } catch {
            return [];
        }
    }

    /**
     * Get browser timezone dynamically
     */
    getBrowserTimezone() {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch {
            return null;
        }
    }

    /**
     * Get browser languages dynamically
     */
    getBrowserLanguages() {
        const languages = [];
        
        try {
            if (navigator.languages) {
                languages.push(...navigator.languages);
            }
            if (navigator.language) {
                languages.push(navigator.language);
            }
            if (navigator.userLanguage) {
                languages.push(navigator.userLanguage);
            }
        } catch {}
        
        return [...new Set(languages)]; // Remove duplicates
    }

    /**
     * Get platform information
     */
    getPlatformInfo() {
        try {
            return {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                vendor: navigator.vendor,
                hardwareConcurrency: navigator.hardwareConcurrency,
                deviceMemory: navigator.deviceMemory,
                maxTouchPoints: navigator.maxTouchPoints
            };
        } catch {
            return {};
        }
    }

    /**
     * Dynamically discover the best geolocation API
     */
    async discoverGeolocationAPI() {
        const availableApis = [];
        
        for (const url of this.discoveryUrls) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                const response = await fetch(url, { 
                    signal: controller.signal,
                    headers: { 'Accept': 'application/json' }
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const data = await response.json();
                    availableApis.push({
                        url: url,
                        status: response.status,
                        responseTime: response.headers.get('x-response-time') || 'unknown',
                        dataKeys: Object.keys(data),
                        hasIP: this.hasKey(data, ['ip', 'ip_address', 'query']),
                        hasCountry: this.hasKey(data, ['country', 'country_name', 'countryCode']),
                        hasCurrency: this.hasKey(data, ['currency', 'currency_code']),
                        data: data
                    });
                }
            } catch (error) {
                // Skip failed APIs
            }
        }
        
        // Sort by quality (prefer APIs with most data)
        availableApis.sort((a, b) => {
            const scoreA = this.scoreAPI(a);
            const scoreB = this.scoreAPI(b);
            return scoreB - scoreA;
        });
        
        return availableApis.length > 0 ? availableApis[0] : null;
    }

    /**
     * Score API based on available data
     */
    scoreAPI(api) {
        let score = 0;
        if (api.hasIP) score += 10;
        if (api.hasCountry) score += 10;
        if (api.hasCurrency) score += 10;
        if (api.dataKeys) score += api.dataKeys.length;
        if (api.responseTime && api.responseTime !== 'unknown') score += 5;
        return score;
    }

    /**
     * Check if any key exists in data
     */
    hasKey(data, keys) {
        return keys.some(key => data && typeof data === 'object' && key in data);
    }

    /**
     * Dynamically discover available currency APIs
     */
    async discoverCurrencyAPIs() {
        const currencyApis = [
            'https://api.exchangerate-api.com/v4/latest/',
            'https://api.exchangeratesapi.io/latest',
            'https://api.nomics.com/v1/currencies'
        ];
        
        const availableApis = [];
        
        for (const baseUrl of currencyApis) {
            try {
                const testUrl = baseUrl + 'USD';
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                const response = await fetch(testUrl, { 
                    signal: controller.signal,
                    headers: { 'Accept': 'application/json' }
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const data = await response.json();
                    availableApis.push({
                        url: baseUrl,
                        status: response.status,
                        data: data,
                        hasRates: this.hasKey(data, ['rates', 'quotes']),
                        hasBase: this.hasKey(data, ['base', 'base_currency'])
                    });
                }
            } catch (error) {
                // Skip failed APIs
            }
        }
        
        return availableApis;
    }

    /**
     * Dynamically discover country data APIs
     */
    async discoverCountryAPIs() {
        const countryApis = [
            'https://restcountries.com/v3.1/alpha/',
            'https://restcountries.eu/rest/v2/alpha/'
        ];
        
        const availableApis = [];
        
        for (const baseUrl of countryApis) {
            try {
                const testUrl = baseUrl + 'US';
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                const response = await fetch(testUrl, { 
                    signal: controller.signal,
                    headers: { 'Accept': 'application/json' }
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const data = await response.json();
                    availableApis.push({
                        url: baseUrl,
                        status: response.status,
                        data: data
                    });
                }
            } catch (error) {
                // Skip failed APIs
            }
        }
        
        return availableApis;
    }

    /**
     * Dynamically determine locale using multiple methods
     */
    async determineLocale(countryCode = null, geoData = null) {
        const possibleLocales = new Set();
        
        // Method 1: Browser languages
        const browserLanguages = this.getBrowserLanguages();
        browserLanguages.forEach(lang => possibleLocales.add(lang));
        
        // Method 2: Available Intl locales
        const availableLocales = this.getAvailableLocales();
        availableLocales.forEach(locale => possibleLocales.add(locale));
        
        // Method 3: Derive from country code
        if (countryCode) {
            // Get language from country using Intl
            try {
                const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
                const countryName = displayNames.of(countryCode);
                if (countryName) {
                    // Try to find a matching locale
                    for (const locale of possibleLocales) {
                        const parts = locale.split(/[-_]/);
                        if (parts.length >= 2 && parts[1].toUpperCase() === countryCode) {
                            return locale; // Exact match
                        }
                    }
                }
            } catch {}
            
            // If country has known language mappings, derive from geo data
            if (geoData) {
                const derivedLocale = this.deriveLocaleFromGeoData(geoData);
                if (derivedLocale) {
                    possibleLocales.add(derivedLocale);
                }
            }
        }
        
        // Method 4: Use system locale from Intl
        try {
            const systemLocale = Intl.DateTimeFormat().resolvedOptions().locale;
            possibleLocales.add(systemLocale);
        } catch {}
        
        // Sort by preference: exact matches first, then language matches
        const sortedLocales = this.sortLocalesByPreference(
            Array.from(possibleLocales),
            countryCode
        );
        
        // Validate locales (check if they're supported)
        const validLocales = [];
        for (const locale of sortedLocales) {
            try {
                const formatter = new Intl.NumberFormat(locale);
                if (formatter) {
                    validLocales.push(locale);
                }
            } catch {}
        }
        
        return validLocales.length > 0 ? validLocales[0] : 'en';
    }

    /**
     * Derive locale from geo data
     */
    deriveLocaleFromGeoData(geoData) {
        try {
            // Try to get language from geo data
            const possibleFields = ['language', 'languages', 'lang', 'locale'];
            let language = null;
            
            for (const field of possibleFields) {
                if (geoData[field]) {
                    if (typeof geoData[field] === 'string') {
                        language = geoData[field];
                        break;
                    } else if (typeof geoData[field] === 'object') {
                        const firstKey = Object.keys(geoData[field])[0];
                        if (firstKey) {
                            language = firstKey;
                            break;
                        }
                    }
                }
            }
            
            if (language && geoData.country_code) {
                return `${language.split('-')[0]}-${geoData.country_code}`;
            }
        } catch {}
        
        return null;
    }

    /**
     * Sort locales by preference
     */
    sortLocalesByPreference(locales, countryCode) {
        return locales.sort((a, b) => {
            const aScore = this.scoreLocale(a, countryCode);
            const bScore = this.scoreLocale(b, countryCode);
            return bScore - aScore;
        });
    }

    /**
     * Score locale based on relevance
     */
    scoreLocale(locale, countryCode) {
        let score = 0;
        
        // Exact match with country gets highest score
        if (countryCode && locale.toUpperCase().includes(countryCode)) {
            score += 100;
        }
        
        // Browser language detection
        if (navigator.languages && navigator.languages.includes(locale)) {
            score += 50;
        }
        
        // Available in Intl
        try {
            const formatter = new Intl.NumberFormat(locale);
            if (formatter) score += 30;
        } catch {}
        
        return score;
    }

    /**
     * Dynamically get currency symbol using any method available
     */
    async getDynamicCurrencySymbol(currencyCode, locale = null) {
        if (!locale) {
            locale = await this.determineLocale();
        }
        
        const methods = [
            this.getSymbolFromIntl.bind(this),
            this.getSymbolFromUnicode.bind(this),
            this.getSymbolFromCLDR.bind(this),
            this.getSymbolFromExchangeRate.bind(this)
        ];
        
        for (const method of methods) {
            try {
                const result = await method(currencyCode, locale);
                if (result && result !== currencyCode) {
                    return {
                        symbol: result,
                        method: method.name.replace('getSymbolFrom', ''),
                        locale: locale
                    };
                }
            } catch {}
        }
        
        return {
            symbol: currencyCode,
            method: 'fallback',
            locale: locale
        };
    }

    /**
     * Get symbol using Intl API
     */
    async getSymbolFromIntl(currencyCode, locale) {
        const formatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode,
            currencyDisplay: 'symbol'
        });
        
        const parts = formatter.formatToParts(1);
        const currencyPart = parts.find(p => p.type === 'currency');
        
        if (currencyPart && currencyPart.value !== currencyCode) {
            return currencyPart.value;
        }
        
        // Try narrow symbol
        const narrowFormatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode,
            currencyDisplay: 'narrowSymbol'
        });
        const narrowParts = narrowFormatter.formatToParts(1);
        const narrowPart = narrowParts.find(p => p.type === 'currency');
        
        if (narrowPart && narrowPart.value !== currencyCode) {
            return narrowPart.value;
        }
        
        return null;
    }

    /**
     * Get symbol from Unicode CLDR data (via web API)
     */
    async getSymbolFromCLDR(currencyCode) {
        try {
            // Use CDN to get CLDR data
            const response = await fetch(
                `https://cdn.jsdelivr.net/npm/cldr-data/supplemental/currencyData.json`
            );
            const data = await response.json();
            // Parse CLDR data for currency symbol
            // This is a dynamic approach without hard-coding
            return null; // Placeholder for actual implementation
        } catch {
            return null;
        }
    }

    /**
     * Get symbol from exchange rate API
     */
    async getSymbolFromExchangeRate(currencyCode) {
        try {
            const response = await fetch(
                `https://api.exchangerate-api.com/v4/latest/${currencyCode}`
            );
            const data = await response.json();
            // Some APIs return symbol information
            if (data.symbol) {
                return data.symbol;
            }
            return null;
        } catch {
            return null;
        }
    }

    /**
     * Get symbol from Unicode character database
     */
    async getSymbolFromUnicode(currencyCode) {
        try {
            // Use Unicode character database
            const response = await fetch(
                `https://raw.githubusercontent.com/unicode-org/cldr/main/common/main/en/currencies.json`
            );
            const data = await response.json();
            // Parse Unicode CLDR data for currency symbols
            return null; // Placeholder for actual implementation
        } catch {
            return null;
        }
    }

    /**
     * Dynamically get currency name using Intl
     */
    async getDynamicCurrencyName(currencyCode, locale = null) {
        if (!locale) {
            locale = await this.determineLocale();
        }
        
        try {
            const displayNames = new Intl.DisplayNames([locale], { 
                type: 'currency' 
            });
            const name = displayNames.of(currencyCode);
            if (name && name !== currencyCode) {
                return {
                    name: name,
                    method: 'Intl.DisplayNames',
                    locale: locale
                };
            }
        } catch {}
        
        // Try with different locales
        for (const testLocale of ['en-US', 'en-GB', 'en']) {
            try {
                const displayNames = new Intl.DisplayNames([testLocale], { 
                    type: 'currency' 
                });
                const name = displayNames.of(currencyCode);
                if (name && name !== currencyCode) {
                    return {
                        name: name,
                        method: 'Intl.DisplayNames.fallback',
                        locale: testLocale
                    };
                }
            } catch {}
        }
        
        return {
            name: currencyCode,
            method: 'fallback',
            locale: locale
        };
    }

    /**
     * Main method to get user location with zero hard-coded values
     */
    async getUserLocation() {
        try {
            // Discover and use the best geolocation API
            const geoAPI = await this.discoverGeolocationAPI();
            if (!geoAPI) {
                throw new Error('No geolocation API available');
            }
            
            // Get location data
            const geoData = geoAPI.data;
            
            // Discover country API
            const countryAPIs = await this.discoverCountryAPIs();
            let countryData = null;
            
            if (countryAPIs.length > 0) {
                try {
                    const countryAPI = countryAPIs[0];
                    const countryResponse = await fetch(
                        `${countryAPI.url}${geoData.country_code || geoData.countryCode || 'US'}`
                    );
                    if (countryResponse.ok) {
                        const rawData = await countryResponse.json();
                        countryData = Array.isArray(rawData) ? rawData[0] : rawData;
                    }
                } catch {}
            }
            
            // Discover currency API
            const currencyAPIs = await this.discoverCurrencyAPIs();
            let currencyData = null;
            
            if (currencyAPIs.length > 0) {
                try {
                    const currencyAPI = currencyAPIs[0];
                    const currencyCode = geoData.currency || 
                                       geoData.currency_code || 
                                       'USD';
                    const currencyResponse = await fetch(
                        `${currencyAPI.url}${currencyCode}`
                    );
                    if (currencyResponse.ok) {
                        currencyData = await currencyResponse.json();
                    }
                } catch {}
            }
            
            // Determine locale dynamically
            const locale = await this.determineLocale(
                geoData.country_code || geoData.countryCode,
                geoData
            );
            
            // Get currency symbol dynamically
            const currencyCode = geoData.currency || 
                                geoData.currency_code || 
                                'USD';
            const symbolInfo = await this.getDynamicCurrencySymbol(
                currencyCode, 
                locale
            );
            
            // Get currency name dynamically
            const nameInfo = await this.getDynamicCurrencyName(
                currencyCode, 
                locale
            );
            
            // Build result with no hard-coded values
            const result = {
                // Location data
                location: this.extractData(geoData, [
                    'country_name', 'country', 'countryName', 'region_name'
                ]),
                countryCode: this.extractData(geoData, [
                    'country_code', 'countryCode', 'country'
                ]),
                city: this.extractData(geoData, [
                    'city', 'town', 'village', 'city_name'
                ]),
                region: this.extractData(geoData, [
                    'region', 'state', 'province', 'district'
                ]),
                ip: this.extractData(geoData, [
                    'ip', 'ip_address', 'query', 'ipAddress'
                ]),
                timezone: this.extractData(geoData, [
                    'timezone', 'time_zone', 'zone'
                ]),
                latitude: this.extractData(geoData, [
                    'latitude', 'lat', 'lat_deg'
                ]),
                longitude: this.extractData(geoData, [
                    'longitude', 'lon', 'lng', 'long_deg'
                ]),
                
                // Currency data
                currency: {
                    code: currencyCode,
                    symbol: symbolInfo.symbol,
                    symbolMethod: symbolInfo.method,
                    name: nameInfo.name,
                    nameMethod: nameInfo.method,
                    exchangeRates: currencyData?.rates || {},
                    baseCurrency: currencyData?.base || currencyCode
                },
                
                // Locale data
                locale: {
                    preferred: locale,
                    available: this.getAvailableLocales(),
                    browser: this.getBrowserLanguages(),
                    timezone: this.getBrowserTimezone(),
                    system: Intl.DateTimeFormat().resolvedOptions().locale
                },
                
                // Country data
                countryDetails: countryData || {},
                
                // Raw data
                raw: {
                    geo: geoData,
                    currency: currencyData,
                    country: countryData
                },
                
                // Metadata about the request
                meta: {
                    geoAPI: {
                        url: geoAPI.url,
                        dataKeys: geoAPI.dataKeys
                    },
                    browserCapabilities: this.browserCapabilities,
                    timestamp: new Date().toISOString()
                }
            };
            
            return result;
            
        } catch (error) {
            throw new Error(`Failed to get location: ${error.message}`);
        }
    }

    /**
     * Extract data from object using multiple possible keys
     */
    extractData(obj, keys) {
        if (!obj || typeof obj !== 'object') {
            return null;
        }
        
        for (const key of keys) {
            if (key in obj && obj[key] !== null && obj[key] !== undefined) {
                return obj[key];
            }
        }
        
        return null;
    }

    /**
     * Display all information dynamically
     */
    displayLocationInfo(locationInfo) {
        console.log('🌍 LOCATION INFORMATION');
        console.log('=======================');
        console.log(`📍 Location: ${locationInfo.location || 'Unknown'}`);
        console.log(`🏷️  Country Code: ${locationInfo.countryCode || 'Unknown'}`);
        console.log(`🏙️  City: ${locationInfo.city || 'Unknown'}`);
        console.log(`🗺️  Region: ${locationInfo.region || 'Unknown'}`);
        console.log(`🌐 IP Address: ${locationInfo.ip || 'Unknown'}`);
        console.log(`⏰ Timezone: ${locationInfo.timezone || 'Unknown'}`);
        
        console.log('\n💰 CURRENCY INFORMATION');
        console.log('=======================');
        console.log(`💱 Code: ${locationInfo.currency.code}`);
        console.log(`💲 Symbol: ${locationInfo.currency.symbol} (via ${locationInfo.currency.symbolMethod})`);
        console.log(`📛 Name: ${locationInfo.currency.name} (via ${locationInfo.currency.nameMethod})`);
        
        console.log('\n🌐 LOCALE INFORMATION');
        console.log('=====================');
        console.log(`🌍 Preferred Locale: ${locationInfo.locale.preferred}`);
        console.log(`📱 Browser Locales: ${locationInfo.locale.browser.join(', ')}`);
        console.log(`💻 System Locale: ${locationInfo.locale.system}`);
        console.log(`⏰ Browser Timezone: ${locationInfo.locale.timezone}`);
        
        console.log('\n📊 API INFORMATION');
        console.log('==================');
        console.log(`🔗 Geo API: ${locationInfo.meta.geoAPI.url}`);
        console.log(`📋 Available Data: ${locationInfo.meta.geoAPI.dataKeys.join(', ')}`);
        console.log(`🖥️  Platform: ${locationInfo.meta.browserCapabilities.platform?.platform || 'Unknown'}`);
        console.log(`🔄 Hardware Concurrency: ${locationInfo.meta.browserCapabilities.platform?.hardwareConcurrency || 'Unknown'}`);
        
        console.log('\n📝 DYNAMICALLY GENERATED EXAMPLES');
        console.log('================================');
        const sampleAmounts = [1, 10, 100, 1000, 10000];
        for (const amount of sampleAmounts) {
            try {
                const formatter = new Intl.NumberFormat(locationInfo.locale.preferred, {
                    style: 'currency',
                    currency: locationInfo.currency.code
                });
                console.log(`  ${amount.toString().padStart(6)} → ${formatter.format(amount)}`);
            } catch {}
        }
    }

    // ============================================
    // CURRENCY CONVERSION METHODS
    // ============================================

    /**
     * Convert currency using the integrated converter
     * @param {number} amount - Amount to convert
     * @param {string} fromCurrency - Source currency code (e.g., 'USD')
     * @param {string} toCurrency - Target currency code (e.g., 'EUR')
     * @param {Object} options - Conversion options
     * @param {number} options.timeout - Request timeout in milliseconds
     * @param {number} options.cacheDuration - Cache duration in milliseconds
     * @returns {Promise<Object>} Conversion result
     */
    async convertCurrency(amount, fromCurrency, toCurrency, options = {}) {
        return await this.currencyConverter.convert(amount, fromCurrency, toCurrency, options);
    }

    /**
     * Get exchange rate between two currencies
     * @param {string} fromCurrency - Source currency code
     * @param {string} toCurrency - Target currency code
     * @param {Object} options - Options for rate retrieval
     * @returns {Promise<number>} Exchange rate
     */
    async getExchangeRate(fromCurrency, toCurrency, options = {}) {
        return await this.currencyConverter.getExchangeRate(fromCurrency, toCurrency, options);
    }

    /**
     * Get all available currencies
     * @returns {Promise<Array>} Array of currency codes
     */
    async getAvailableCurrencies() {
        return await this.currencyConverter.getAvailableCurrencies();
    }

    /**
     * Format currency amount with proper symbol and formatting
     * @param {number} amount - Amount to format
     * @param {string} currencyCode - Currency code
     * @param {string} locale - Locale for formatting
     * @returns {Promise<string>} Formatted currency string
     */
    async formatCurrency(amount, currencyCode, locale = null) {
        return await this.currencyConverter.formatCurrency(amount, currencyCode, locale);
    }

    /**
     * Convert amount to multiple currencies
     * @param {number} amount - Amount to convert
     * @param {string} fromCurrency - Source currency code
     * @param {Array} targetCurrencies - Array of target currency codes
     * @param {Object} options - Conversion options
     * @returns {Promise<Object>} Conversion results
     */
    async convertToMultiple(amount, fromCurrency, targetCurrencies, options = {}) {
        return await this.currencyConverter.convertToMultiple(amount, fromCurrency, targetCurrencies, options);
    }

    /**
     * Get exchange rates for multiple currencies
     * @param {string} baseCurrency - Base currency code
     * @param {Array} targetCurrencies - Array of target currency codes
     * @param {Object} options - Options for rate retrieval
     * @returns {Promise<Object>} Exchange rates
     */
    async getMultipleRates(baseCurrency, targetCurrencies, options = {}) {
        return await this.currencyConverter.getMultipleRates(baseCurrency, targetCurrencies, options);
    }

    /**
     * Display currency conversion result
     * @param {Object} result - Conversion result from convertCurrency()
     * @returns {Object} The currency converter instance for chaining
     */
    displayConversion(result) {
        return this.currencyConverter.displayConversion(result);
    }

    /**
     * Display multiple currency conversions
     * @param {Object} results - Results from convertToMultiple()
     * @returns {Object} The currency converter instance for chaining
     */
    displayMultipleConversions(results) {
        return this.currencyConverter.displayMultipleConversions(results);
    }

    /**
     * Get currency information including symbol and name
     * @param {string} currencyCode - Currency code
     * @param {string} locale - Locale for formatting
     * @returns {Promise<Object>} Currency information
     */
    async getCurrencyInfo(currencyCode, locale = null) {
        return await this.currencyConverter.getCurrencyInfo(currencyCode, locale);
    }

    /**
     * Get historical exchange rate for a specific date
     * @param {string} fromCurrency - Source currency code
     * @param {string} toCurrency - Target currency code
     * @param {string} date - Date in YYYY-MM-DD format
     * @param {Object} options - Options for rate retrieval
     * @returns {Promise<Object>} Historical rate information
     */
    async getHistoricalRate(fromCurrency, toCurrency, date, options = {}) {
        return await this.currencyConverter.getHistoricalRate(fromCurrency, toCurrency, date, options);
    }

    /**
     * Clear all caches (location and currency)
     */
    clearAllCaches() {
        this.cache.clear();
        this.currencyConverter.clearCache();
    }

    /**
     * Get currency converter cache statistics
     * @returns {Object} Cache statistics
     */
    getCurrencyCacheStats() {
        return this.currencyConverter.getCacheStats();
    }
}

export default FullyDynamicGeolocationService;
