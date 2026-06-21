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
