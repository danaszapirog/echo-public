#!/usr/bin/env tsx
/**
 * Mapbox API Token Verification Script
 * 
 * This script verifies that your Mapbox access token is valid and working.
 * Run with: npx tsx scripts/verify-mapbox-token.ts
 */

import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config({ path: '.env' });

const MAPBOX_TOKEN = process.env.MAPBOX_ACCESS_TOKEN;

async function verifyMapboxToken() {
  console.log('🔍 Verifying Mapbox API Token...\n');

  // Check if token exists
  if (!MAPBOX_TOKEN) {
    console.error('❌ MAPBOX_ACCESS_TOKEN not found in .env file');
    console.log('\n💡 To fix this:');
    console.log('   1. Get your token from: https://account.mapbox.com/access-tokens/');
    console.log('   2. Add it to backend/.env: MAPBOX_ACCESS_TOKEN=your-token-here');
    process.exit(1);
  }

  // Check token format (Mapbox tokens start with 'pk.')
  if (!MAPBOX_TOKEN.startsWith('pk.')) {
    console.warn('⚠️  Warning: Mapbox tokens typically start with "pk."');
    console.warn('   Your token might be incorrect.\n');
  }

  console.log(`✅ Token found: ${MAPBOX_TOKEN.substring(0, 10)}...`);
  console.log('   Testing API access...\n');

  try {
    // Test 1: Verify token with Mapbox Token API
    console.log('📡 Test 1: Verifying token with Mapbox API...');
    const tokenResponse = await axios.get(
      `https://api.mapbox.com/tokens/v2?access_token=${MAPBOX_TOKEN}`,
      { timeout: 5000 }
    );

    if (tokenResponse.status === 200) {
      console.log('✅ Token is valid!');
      console.log(`   Token ID: ${tokenResponse.data.id || 'N/A'}`);
      console.log(`   Token Type: ${tokenResponse.data.type || 'N/A'}`);
      console.log(`   Created: ${tokenResponse.data.created || 'N/A'}\n`);
    }

    // Test 2: Test Geocoding API (common use case)
    console.log('📡 Test 2: Testing Geocoding API...');
    const geocodeResponse = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/New York.json`,
      {
        params: {
          access_token: MAPBOX_TOKEN,
          limit: 1,
        },
        timeout: 5000,
      }
    );

    if (geocodeResponse.status === 200 && geocodeResponse.data.features) {
      console.log('✅ Geocoding API works!');
      const feature = geocodeResponse.data.features[0];
      console.log(`   Test query: "New York"`);
      console.log(`   Result: ${feature.place_name || 'N/A'}\n`);
    }

    // Test 3: Test Directions API (if token has directions scope)
    console.log('📡 Test 3: Testing Directions API...');
    try {
      const directionsResponse = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/driving/-73.9857,40.7484;-73.9881,40.7505`,
        {
          params: {
            access_token: MAPBOX_TOKEN,
            geometries: 'geojson',
          },
          timeout: 5000,
        }
      );

      if (directionsResponse.status === 200) {
        console.log('✅ Directions API works!');
        console.log(`   Route duration: ${directionsResponse.data.routes[0]?.duration || 'N/A'} seconds\n`);
      }
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('⚠️  Directions API requires additional scopes (this is OK for MVP)\n');
      } else {
        throw error;
      }
    }

    console.log('🎉 All tests passed! Your Mapbox token is working correctly.');
    console.log('\n📋 Token Status:');
    console.log('   ✅ Token is valid');
    console.log('   ✅ Geocoding API accessible');
    console.log('   ✅ Ready for Phase 6 implementation');
    console.log('\n💡 Note: For Phase 6, you primarily need:');
    console.log('   - Map rendering (included in all tokens)');
    console.log('   - Geocoding API (tested above)');
    console.log('   - Directions API (optional, for future features)');

  } catch (error: any) {
    if (error.response) {
      // API returned an error
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        console.error('❌ Authentication failed - Invalid token');
        console.error(`   Error: ${data.message || 'Unauthorized'}`);
        console.log('\n💡 To fix this:');
        console.log('   1. Verify your token at: https://account.mapbox.com/access-tokens/');
        console.log('   2. Make sure the token is copied correctly (no extra spaces)');
        console.log('   3. Check if the token has expired');
      } else if (status === 403) {
        console.error('❌ Access forbidden - Token may not have required scopes');
        console.error(`   Error: ${data.message || 'Forbidden'}`);
        console.log('\n💡 To fix this:');
        console.log('   1. Check token scopes in Mapbox dashboard');
        console.log('   2. Ensure token has "Public" scope for map rendering');
      } else {
        console.error(`❌ API Error (${status}):`, data.message || 'Unknown error');
      }
    } else if (error.request) {
      console.error('❌ Network error - Could not reach Mapbox API');
      console.error('   Check your internet connection');
    } else {
      console.error('❌ Error:', error.message);
    }

    process.exit(1);
  }
}

// Run verification
verifyMapboxToken().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

