# Dynamic Geolocation Service

A fully dynamic geolocation service with zero hard-coded values. Automatically discovers and uses the best available APIs for geolocation, currency, and country data.

## Features

- 🔍 **Dynamic API Discovery**: Automatically discovers and selects the best available geolocation APIs
- 🌐 **Zero Hard-Coded Values**: No hard-coded URLs, cache durations, or locale data
- 💱 **Currency Support**: Dynamically discovers currency symbols and names using multiple methods
- 🌍 **Locale Detection**: Intelligently determines the best locale using multiple detection methods
- 🔄 **Browser & Node Support**: Works in both browser and Node.js environments

## Installation

```bash
npm install @Dr-Nio/geo-service

## Quick Start

```bash

import FullyDynamicGeolocationService from '@Dr-Nio/geo-service';

// Create instance
const geolocation = new FullyDynamicGeolocationService();

// Get user location
const locationInfo = await geolocation.getUserLocation();

console.log(`Location: ${locationInfo.location}`);
console.log(`Currency: ${locationInfo.currency.symbol} ${locationInfo.currency.code}`);
console.log(`Locale: ${locationInfo.locale.preferred}`);

```

## Usage Guide

```bash

const service = new FullyDynamicGeolocationService();
const location = await service.getUserLocation();
service.displayLocationInfo(location);

```

## Browser Usage

```bash

<script type="module">
import FullyDynamicGeolocationService from './node_modules/@Dr-Nio/geo-service/src/index.js';

const service = new FullyDynamicGeolocationService();
const location = await service.getUserLocation();
console.log(location);
</script>

```

## API Reference

constructor()

Creates a new instance with dynamic discovery URLs and browser capability detection.
getUserLocation()

Main method to get user location with zero hard-coded values.

Returns: Promise resolving to location information object.
displayLocationInfo(locationInfo)

Displays location information in a formatted console output.
discoverGeolocationAPI()

Dynamically discovers the best geolocation API from available endpoints.
discoverCurrencyAPIs()

Dynamically discovers available currency APIs.
discoverCountryAPIs()

Dynamically discovers available country data APIs.
determineLocale(countryCode, geoData)

Dynamically determines the best locale using multiple methods.
getDynamicCurrencySymbol(currencyCode, locale)

Dynamically gets currency symbol using any method available.
getDynamicCurrencyName(currencyCode, locale)

Dynamically gets currency name using Intl API.
Browser Support

All modern browsers with:

    Fetch API

    Intl API

    ES6+ features
