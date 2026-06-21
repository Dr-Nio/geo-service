## Dynamic Geolocation & Currency Service

A fully dynamic geolocation and currency service with zero hard-coded values. Automatically discovers and uses the best available APIs for geolocation, currency conversion, exchange rates, and country data.

## Features

- 🔍 **Dynamic API Discovery**: Automatically discovers and selects the best available APIs
- 🌐 **Zero Hard-Coded Values**: No hard-coded URLs, cache durations, or locale data
- 💱 **Currency Conversion**: Real-time currency conversion with dynamic exchange rate discovery
- 💲 **Currency Information**: Dynamically discovers currency symbols, names, and formatting
- 🌍 **Locale Detection**: Intelligently determines the best locale using multiple detection methods
- 📊 **Multi-Currency Support**: Convert to multiple currencies simultaneously
- ⏱️ **Historical Rates**: Support for historical exchange rate lookups
- 🔄 **Browser & Node Support**: Works in both browser and Node.js environments
- 🚀 **Smart Caching**: Automatic caching with configurable duration

## Installation

```bash
npm install @dr-nio/geo-service
```

## Quick Start

```javascript
import FullyDynamicGeolocationService from '@dr-nio/geo-service';

// Create instance
const service = new FullyDynamicGeolocationService();

// Get user location
const location = await service.getUserLocation();
console.log(`Location: ${location.location}`);
console.log(`Currency: ${location.currency.symbol} ${location.currency.code}`);

// Convert currency
const conversion = await service.convertCurrency(100, 'USD', 'EUR');
console.log(`100 USD = ${conversion.convertedAmount} EUR`);
```

## Usage Examples

### Basic Geolocation

```javascript
import FullyDynamicGeolocationService from '@dr-nio/geo-service';

const service = new FullyDynamicGeolocationService();

// Get location with auto-detection
const location = await service.getUserLocation();
service.displayLocationInfo(location);
```

### Currency Conversion

```javascript
// Simple conversion
const result = await service.convertCurrency(100, 'USD', 'EUR');
console.log(`${result.amount} ${result.fromCurrency} = ${result.convertedAmount} ${result.toCurrency}`);
console.log(`Rate: 1 ${result.fromCurrency} = ${result.rate} ${result.toCurrency}`);

// Convert to multiple currencies
const conversions = await service.convertToMultiple(100, 'USD', ['EUR', 'GBP', 'JPY', 'CAD']);
service.displayMultipleConversions(conversions);

// Get exchange rate
const rate = await service.getExchangeRate('USD', 'EUR');
console.log(`1 USD = ${rate} EUR`);

// Format currency
const formatted = await service.formatCurrency(1234.56, 'EUR', 'fr-FR');
console.log(`Formatted: ${formatted}`); // 1 234,56 €
```

### Advanced Features

```javascript
// Get available currencies
const currencies = await service.getAvailableCurrencies();
console.log(`Found ${currencies.length} currencies`);

// Get historical exchange rate
const historical = await service.getHistoricalRate('USD', 'EUR', '2024-01-01');
console.log(`Historical rate: ${historical.rate}`);

// Get currency information
const info = await service.getCurrencyInfo('JPY', 'ja-JP');
console.log(`Currency: ${info.name} (${info.symbol})`);

// Get multiple exchange rates
const rates = await service.getMultipleRates('USD', ['EUR', 'GBP', 'JPY']);
console.log(rates);
```

### Smart Integration

```javascript
// Automatically convert based on user's location
const location = await service.getUserLocation();
const amount = 100;
const conversion = await service.convertCurrency(amount, 'USD', location.currency.code);

console.log(`${amount} USD = ${conversion.convertedAmount} ${location.currency.symbol}`);
console.log(`Location: ${location.location}`);
console.log(`Local currency: ${location.currency.name}`);
```

## API Reference

### FullyDynamicGeolocationService

#### Geolocation Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `getUserLocation()` | Gets user location with dynamic discovery | `Promise<LocationResult>` |
| `getBrowserCapabilities()` | Returns detected browser capabilities | `Object` |
| `displayLocationInfo(locationInfo)` | Displays location information | `void` |

#### Currency Conversion Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `convertCurrency(amount, from, to, options)` | Converts currency with dynamic rate discovery | `Promise<ConversionResult>` |
| `getExchangeRate(from, to, options)` | Gets exchange rate between two currencies | `Promise<number>` |
| `getAvailableCurrencies()` | Gets list of all available currencies | `Promise<Array>` |
| `formatCurrency(amount, currency, locale)` | Formats currency with proper symbol | `Promise<string>` |
| `convertToMultiple(amount, from, targets, options)` | Converts to multiple currencies | `Promise<MultiConversionResult>` |
| `getMultipleRates(base, targets, options)` | Gets multiple exchange rates | `Promise<Object>` |
| `getHistoricalRate(from, to, date, options)` | Gets historical exchange rate | `Promise<HistoricalRateResult>` |
| `getCurrencyInfo(currency, locale)` | Gets currency symbol and name | `Promise<CurrencyInfo>` |

#### Utility Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `displayConversion(result)` | Displays conversion result | `Object` |
| `displayMultipleConversions(results)` | Displays multiple conversions | `Object` |
| `clearAllCaches()` | Clears all caches | `void` |
| `getCurrencyCacheStats()` | Gets cache statistics | `Object` |

## Configuration

```javascript
const service = new FullyDynamicGeolocationService({
  discoveryUrls: ['https://ipapi.co/json/', 'https://ipinfo.io/json'],
  timeout: 5000,
  cacheEnabled: true,
  cacheDuration: 300000 // 5 minutes
});
```

## Complete Example

```javascript
import FullyDynamicGeolocationService from '@dr-nio/geo-service';

async function main() {
  const service = new FullyDynamicGeolocationService();
  
  try {
    // 1. Get location
    console.log('📍 Getting location...');
    const location = await service.getUserLocation();
    service.displayLocationInfo(location);
    
    // 2. Convert currency based on location
    console.log('\n💱 Converting currency based on your location...');
    const amount = 100;
    const conversion = await service.convertCurrency(amount, 'USD', location.currency.code);
    service.displayConversion(conversion);
    
    // 3. Get available currencies
    console.log('\n🌐 Available currencies:');
    const currencies = await service.getAvailableCurrencies();
    console.log(`Found ${currencies.length} currencies`);
    console.log(`Sample: ${currencies.slice(0, 10).join(', ')}...`);
    
    // 4. Convert to multiple currencies
    console.log('\n💱 Converting to multiple currencies:');
    const targets = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
    const multi = await service.convertToMultiple(1000, 'USD', targets);
    service.displayMultipleConversions(multi);
    
    // 5. Format currency
    console.log('\n💰 Formatted amounts:');
    const formats = [
      { amount: 1234.56, currency: 'USD', locale: 'en-US' },
      { amount: 1234.56, currency: 'EUR', locale: 'fr-FR' },
      { amount: 1234.56, currency: 'JPY', locale: 'ja-JP' }
    ];
    for (const f of formats) {
      const formatted = await service.formatCurrency(f.amount, f.currency, f.locale);
      console.log(`  ${f.locale} (${f.currency}): ${formatted}`);
    }
    
    // 6. Cache stats
    const stats = service.getCurrencyCacheStats();
    console.log('\n📊 Cache Statistics:');
    console.log(`  ${stats.size} cached rates`);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

## Browser Support

All modern browsers with:
- Fetch API
- Intl API (ECMAScript Internationalization API)
- ES6+ features

## Node.js Support

Requires Node.js 14+ with:
- Native fetch API (or node-fetch for older versions)
- Intl API support

## License

MIT

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## Issues

If you find a bug or have a suggestion, please open an issue on GitHub.

## Changelog

### v3.0.0
- Initial release
- Dynamic geolocation discovery
- Currency conversion with dynamic exchange rates
- Multi-currency support
- Historical rate lookup
- Smart caching
- Intl-based formatting


## Key Updates Made:

1. **Title**: Changed to "Dynamic Geolocation & Currency Service"
2. **Features**: Added currency conversion, multi-currency, historical rates, and smart caching
3. **Quick Start**: Added currency conversion example
4. **Usage Examples**: Added comprehensive sections for:
   - Basic geolocation
   - Currency conversion
   - Advanced features
   - Smart integration
5. **API Reference**: Organized into tables for easy reading with:
   - Geolocation methods
   - Currency conversion methods
   - Utility methods
6. **Complete Example**: A full working example showing all features
7. **Browser/Node Support**: Detailed requirements
8. **Changelog**: Added version tracking

The README now fully documents both the geolocation and currency conversion capabilities while maintaining the zero-hard-coded philosophy throughout!
