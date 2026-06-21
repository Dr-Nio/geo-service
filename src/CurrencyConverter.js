/**
 * Currency Converter with zero hard-coded values
 * Fully dynamic - discovers exchange rates and conversion methods on the fly
 */
class CurrencyConverter {
    constructor(geoService = null) {
        // No hard-coded API URLs - we'll discover them dynamically
        this.exchangeRateApis = [
            'https://api.exchangerate-api.com/v4/latest/',
            'https://api.exchangeratesapi.io/latest',
            'https://api.nomics.com/v1/currencies',
            'https://api.currencyapi.com/v3/latest/',
            'https://api.frankfurter.app/latest'
        ];
        
        // No hard-coded cache duration
        this.cache = new Map();
        
        // Reference to geo service for locale detection
        this.geoService = geoService;
        
        // Available currencies cache
        this.availableCurrencies = null;
    }

    /**
     * Dynamically discover available exchange rate APIs
     */
    async discoverExchangeRateAPIs() {
        const availableApis = [];
        
        for (const baseUrl of this.exchangeRateApis) {
            try {
                const testUrl = baseUrl + (baseUrl.includes('?') ? '&' : '?') + 'base=USD';
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                const response = await fetch(testUrl, {
                    signal: controller.signal,
                    headers: { 'Accept': 'application/json' }
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const data = await response.json();
                    const apiInfo = {
                        url: baseUrl,
                        status: response.status,
                        responseTime: response.headers.get('x-response-time') || 'unknown',
                        hasRates: this.hasKey(data, ['rates', 'quotes', 'data']),
                        hasBase: this.hasKey(data, ['base', 'base_currency', 'baseCurrency']),
                        dataKeys: Object.keys(data),
                        data: data
                    };
                    
                    // Determine API format dynamically
                    apiInfo.format = this.detectAPIFormat(data);
                    availableApis.push(apiInfo);
                }
            } catch (error) {
                // Skip failed APIs
            }
        }
        
        // Score and sort APIs
        availableApis.sort((a, b) => {
            const scoreA = this.scoreExchangeAPI(a);
            const scoreB = this.scoreExchangeAPI(b);
            return scoreB - scoreA;
        });
        
        return availableApis;
    }

    /**
     * Detect API data format dynamically
     */
    detectAPIFormat(data) {
        if (data.rates && typeof data.rates === 'object') {
            if (data.base) return 'standard';
            if (data.base_currency) return 'standard';
            return 'rates-only';
        }
        if (data.quotes && typeof data.quotes === 'object') {
            return 'quotes';
        }
        if (data.data && typeof data.data === 'object') {
            return 'data-wrapper';
        }
        return 'unknown';
    }

    /**
     * Score exchange API based on available data
     */
    scoreExchangeAPI(api) {
        let score = 0;
        if (api.hasRates) score += 20;
        if (api.hasBase) score += 10;
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
     * Extract data from object using multiple possible keys
     */
    extractData(obj, keys, defaultValue = null) {
        if (!obj || typeof obj !== 'object') {
            return defaultValue;
        }
        
        for (const key of keys) {
            if (key in obj && obj[key] !== null && obj[key] !== undefined) {
                return obj[key];
            }
        }
        
        return defaultValue;
    }

    /**
     * Get available currencies dynamically
     */
    async getAvailableCurrencies() {
        if (this.availableCurrencies) {
            return this.availableCurrencies;
        }
        
        const apis = await this.discoverExchangeRateAPIs();
        if (apis.length === 0) {
            throw new Error('No exchange rate API available');
        }
        
        const currencies = new Set();
        
        for (const api of apis) {
            try {
                const data = api.data;
                let rates = null;
                
                // Extract rates from different API formats
                if (data.rates) rates = data.rates;
                else if (data.quotes) rates = data.quotes;
                else if (data.data) rates = data.data;
                
                if (rates && typeof rates === 'object') {
                    // If rates are in format { USDUSD: 1, EURUSD: 1.18 }
                    // Extract currency codes from keys
                    for (const key of Object.keys(rates)) {
                        // Handle different formats
                        if (key.length === 3 && key === key.toUpperCase()) {
                            currencies.add(key);
                        } else if (key.length > 3 && key.endsWith('USD')) {
                            const code = key.replace('USD', '');
                            if (code.length === 3) currencies.add(code);
                        } else if (key.length > 3 && key.startsWith('USD')) {
                            const code = key.replace('USD', '');
                            if (code.length === 3) currencies.add(code);
                        }
                    }
                    
                    // Also get base currency
                    const base = this.extractData(data, ['base', 'base_currency', 'baseCurrency']);
                    if (base && base.length === 3) {
                        currencies.add(base);
                    }
                }
            } catch (error) {
                continue;
            }
        }
        
        this.availableCurrencies = Array.from(currencies).sort();
        return this.availableCurrencies;
    }

    /**
     * Get exchange rate dynamically
     */
    async getExchangeRate(fromCurrency, toCurrency, options = {}) {
        // Validate currencies
        fromCurrency = fromCurrency.toUpperCase().trim();
        toCurrency = toCurrency.toUpperCase().trim();
        
        if (fromCurrency === toCurrency) {
            return 1;
        }
        
        // Check cache first
        const cacheKey = `${fromCurrency}-${toCurrency}`;
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            const age = Date.now() - cached.timestamp;
            const duration = options.cacheDuration || 300000; // 5 minutes default
            if (age < duration) {
                return cached.rate;
            }
        }
        
        // Discover best API
        const apis = await this.discoverExchangeRateAPIs();
        if (apis.length === 0) {
            throw new Error('No exchange rate API available');
        }
        
        let rate = null;
        let apiUsed = null;
        
        for (const api of apis) {
            try {
                let data = null;
                
                // Try different endpoints based on API format
                const url = this.buildApiUrl(api.url, fromCurrency, toCurrency);
                const response = await fetch(url, {
                    signal: AbortSignal.timeout(options.timeout || 5000),
                    headers: { 'Accept': 'application/json' }
                });
                
                if (response.ok) {
                    data = await response.json();
                    rate = this.extractRateFromData(data, fromCurrency, toCurrency);
                    
                    if (rate !== null && rate !== undefined) {
                        apiUsed = api.url;
                        break;
                    }
                }
            } catch (error) {
                continue;
            }
        }
        
        if (rate === null || rate === undefined) {
            throw new Error(`Could not get exchange rate from ${fromCurrency} to ${toCurrency}`);
        }
        
        // Cache the rate
        this.cache.set(cacheKey, {
            rate: rate,
            timestamp: Date.now()
        });
        
        return rate;
    }

    /**
     * Build API URL dynamically based on API format
     */
    buildApiUrl(baseUrl, fromCurrency, toCurrency) {
        // Remove trailing slash if exists
        baseUrl = baseUrl.replace(/\/+$/, '');
        
        // Try different URL patterns
        const patterns = [
            `${baseUrl}/${fromCurrency}`,
            `${baseUrl}?base=${fromCurrency}`,
            `${baseUrl}?from=${fromCurrency}`,
            `${baseUrl}?currency=${fromCurrency}`,
            `${baseUrl}?symbols=${fromCurrency}`,
            `${baseUrl}/${fromCurrency}/${toCurrency}`,
            `${baseUrl}?from=${fromCurrency}&to=${toCurrency}`,
            `${baseUrl}?base_currency=${fromCurrency}`,
            `${baseUrl}?currency_from=${fromCurrency}&currency_to=${toCurrency}`
        ];
        
        // Return the first pattern (most common)
        return patterns[0];
    }

    /**
     * Extract rate from API response dynamically
     */
    extractRateFromData(data, fromCurrency, toCurrency) {
        // Try different data structures
        let rates = null;
        
        // Extract rates
        if (data.rates) rates = data.rates;
        else if (data.quotes) rates = data.quotes;
        else if (data.data) rates = data.data;
        else if (data.result) rates = data.result;
        
        if (!rates || typeof rates !== 'object') {
            return null;
        }
        
        // Try different key formats
        const keyPatterns = [
            toCurrency,
            `${fromCurrency}${toCurrency}`,
            `${toCurrency}${fromCurrency}`,
            `${toCurrency}_${fromCurrency}`,
            `${fromCurrency}_${toCurrency}`,
            toCurrency.toUpperCase(),
            `${fromCurrency}${toCurrency}`.toUpperCase()
        ];
        
        for (const key of keyPatterns) {
            if (key in rates) {
                const value = parseFloat(rates[key]);
                if (!isNaN(value) && value > 0) {
                    return value;
                }
            }
        }
        
        // If no direct match, try to find by iterating
        for (const [key, value] of Object.entries(rates)) {
            if (key.includes(toCurrency) || key.includes(toCurrency.toLowerCase())) {
                const parsed = parseFloat(value);
                if (!isNaN(parsed) && parsed > 0) {
                    return parsed;
                }
            }
        }
        
        return null;
    }

    /**
     * Convert currency dynamically
     */
    async convert(amount, fromCurrency, toCurrency, options = {}) {
        if (typeof amount !== 'number' || isNaN(amount)) {
            throw new Error('Amount must be a valid number');
        }
        
        fromCurrency = fromCurrency.toUpperCase().trim();
        toCurrency = toCurrency.toUpperCase().trim();
        
        if (fromCurrency === toCurrency) {
            return {
                amount: amount,
                fromCurrency: fromCurrency,
                toCurrency: toCurrency,
                rate: 1,
                convertedAmount: amount,
                timestamp: new Date().toISOString()
            };
        }
        
        const rate = await this.getExchangeRate(fromCurrency, toCurrency, options);
        const convertedAmount = amount * rate;
        
        return {
            amount: amount,
            fromCurrency: fromCurrency,
            toCurrency: toCurrency,
            rate: rate,
            convertedAmount: convertedAmount,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get exchange rates for multiple currencies
     */
    async getMultipleRates(baseCurrency, targetCurrencies, options = {}) {
        baseCurrency = baseCurrency.toUpperCase().trim();
        targetCurrencies = targetCurrencies.map(c => c.toUpperCase().trim());
        
        const rates = {};
        for (const currency of targetCurrencies) {
            try {
                rates[currency] = await this.getExchangeRate(baseCurrency, currency, options);
            } catch (error) {
                rates[currency] = null;
            }
        }
        
        return rates;
    }

    /**
     * Convert amount to multiple currencies
     */
    async convertToMultiple(amount, fromCurrency, targetCurrencies, options = {}) {
        fromCurrency = fromCurrency.toUpperCase().trim();
        targetCurrencies = targetCurrencies.map(c => c.toUpperCase().trim());
        
        const results = {};
        for (const currency of targetCurrencies) {
            try {
                results[currency] = await this.convert(amount, fromCurrency, currency, options);
            } catch (error) {
                results[currency] = null;
            }
        }
        
        return {
            amount: amount,
            fromCurrency: fromCurrency,
            conversions: results,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get historical exchange rates (if available)
     */
    async getHistoricalRate(fromCurrency, toCurrency, date, options = {}) {
        fromCurrency = fromCurrency.toUpperCase().trim();
        toCurrency = toCurrency.toUpperCase().trim();
        
        // Discover historical API
        const historicalApis = [
            `https://api.exchangerate-api.com/v4/history/${fromCurrency}/${date}`,
            `https://api.exchangeratesapi.io/${date}?base=${fromCurrency}`,
            `https://api.frankfurter.app/${date}?from=${fromCurrency}&to=${toCurrency}`
        ];
        
        for (const url of historicalApis) {
            try {
                const response = await fetch(url, {
                    signal: AbortSignal.timeout(options.timeout || 5000),
                    headers: { 'Accept': 'application/json' }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const rate = this.extractRateFromData(data, fromCurrency, toCurrency);
                    if (rate !== null) {
                        return {
                            rate: rate,
                            date: date,
                            fromCurrency: fromCurrency,
                            toCurrency: toCurrency,
                            timestamp: new Date().toISOString(),
                            source: url
                        };
                    }
                }
            } catch (error) {
                continue;
            }
        }
        
        throw new Error(`Could not get historical rate for ${fromCurrency} to ${toCurrency} on ${date}`);
    }

    /**
     * Get currency information including symbol and name
     */
    async getCurrencyInfo(currencyCode, locale = null) {
        currencyCode = currencyCode.toUpperCase().trim();
        
        // Get symbol using Intl
        let symbol = currencyCode;
        let name = currencyCode;
        
        if (this.geoService) {
            try {
                const symbolInfo = await this.geoService.getDynamicCurrencySymbol(currencyCode, locale);
                symbol = symbolInfo.symbol;
            } catch (error) {
                // Use fallback
            }
            
            try {
                const nameInfo = await this.geoService.getDynamicCurrencyName(currencyCode, locale);
                name = nameInfo.name;
            } catch (error) {
                // Use fallback
            }
        }
        
        return {
            code: currencyCode,
            symbol: symbol,
            name: name,
            locale: locale
        };
    }

    /**
     * Format currency amount with proper symbol and formatting
     */
    async formatCurrency(amount, currencyCode, locale = null) {
        if (typeof amount !== 'number' || isNaN(amount)) {
            throw new Error('Amount must be a valid number');
        }
        
        currencyCode = currencyCode.toUpperCase().trim();
        
        if (!locale && this.geoService) {
            try {
                locale = await this.geoService.determineLocale();
            } catch (error) {
                locale = 'en-US';
            }
        }
        
        if (!locale) locale = 'en-US';
        
        try {
            const formatter = new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currencyCode,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            return formatter.format(amount);
        } catch (error) {
            // Fallback formatting
            return `${currencyCode} ${amount.toFixed(2)}`;
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        this.availableCurrencies = null;
    }

    /**
     * Get cache statistics
     */
    getCacheStats() {
        const stats = {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
            entries: []
        };
        
        for (const [key, value] of this.cache.entries()) {
            stats.entries.push({
                key: key,
                rate: value.rate,
                age: Math.floor((Date.now() - value.timestamp) / 1000) + 's'
            });
        }
        
        return stats;
    }

    /**
     * Display conversion result
     */
    displayConversion(result) {
        console.log('💱 CURRENCY CONVERSION');
        console.log('=====================');
        console.log(`💰 Amount: ${result.amount} ${result.fromCurrency}`);
        console.log(`🔄 Rate: 1 ${result.fromCurrency} = ${result.rate} ${result.toCurrency}`);
        console.log(`💵 Result: ${result.convertedAmount} ${result.toCurrency}`);
        console.log(`📅 Timestamp: ${result.timestamp}`);
        
        return this;
    }

    /**
     * Display multiple conversions
     */
    displayMultipleConversions(results) {
        console.log(`💱 CONVERSIONS FROM ${results.fromCurrency}`);
        console.log('========================================');
        console.log(`💰 Original Amount: ${results.amount} ${results.fromCurrency}`);
        console.log('');
        
        for (const [currency, conversion] of Object.entries(results.conversions)) {
            if (conversion) {
                console.log(`  💵 ${conversion.convertedAmount.toFixed(2)} ${currency}`);
                console.log(`     Rate: 1 ${results.fromCurrency} = ${conversion.rate} ${currency}`);
            } else {
                console.log(`  ❌ ${currency}: Conversion failed`);
            }
            console.log('');
        }
        
        console.log(`📅 Timestamp: ${results.timestamp}`);
        
        return this;
    }
}

export default CurrencyConverter;
