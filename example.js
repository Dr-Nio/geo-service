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
