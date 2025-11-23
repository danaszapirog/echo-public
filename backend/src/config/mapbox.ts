/**
 * Mapbox Configuration
 * 
 * This module provides Mapbox API configuration and utilities.
 * Used for Phase 6: Map Integration & Discovery
 */

import env from './env';

/**
 * Mapbox access token
 * Get your token from: https://account.mapbox.com/access-tokens/
 */
export const MAPBOX_ACCESS_TOKEN = env.MAPBOX_ACCESS_TOKEN || '';

/**
 * Mapbox API base URL
 */
export const MAPBOX_API_BASE_URL = 'https://api.mapbox.com';

/**
 * Mapbox API endpoints
 */
export const MAPBOX_ENDPOINTS = {
  GEOCODING: `${MAPBOX_API_BASE_URL}/geocoding/v5/mapbox.places`,
  DIRECTIONS: `${MAPBOX_API_BASE_URL}/directions/v5/mapbox`,
  TOKENS: `${MAPBOX_API_BASE_URL}/tokens/v2`,
} as const;

/**
 * Verify Mapbox token is configured
 */
export function verifyMapboxToken(): void {
  if (!MAPBOX_ACCESS_TOKEN) {
    throw new Error(
      'MAPBOX_ACCESS_TOKEN is not configured. Please set it in your .env file.'
    );
  }

  if (!MAPBOX_ACCESS_TOKEN.startsWith('pk.')) {
    console.warn(
      'Warning: Mapbox tokens typically start with "pk.". Your token might be incorrect.'
    );
  }
}

/**
 * Get Mapbox token for client-side use (if needed)
 * 
 * Note: For security, consider exposing token only to authenticated users
 * or using token scoping to limit permissions.
 */
export function getClientToken(): string {
  verifyMapboxToken();
  return MAPBOX_ACCESS_TOKEN;
}

/**
 * Mapbox API version
 */
export const MAPBOX_API_VERSION = 'v5';

/**
 * Default map style (for mobile clients)
 * 
 * Options:
 * - mapbox://styles/mapbox/streets-v12 (default)
 * - mapbox://styles/mapbox/outdoors-v12
 * - mapbox://styles/mapbox/light-v11
 * - mapbox://styles/mapbox/dark-v11
 * - mapbox://styles/mapbox/satellite-v9
 * - mapbox://styles/mapbox/satellite-streets-v12
 * - Custom style URL (from Mapbox Studio)
 */
export const DEFAULT_MAP_STYLE = 'mapbox://styles/mapbox/streets-v12';

/**
 * Map configuration constants
 */
export const MAP_CONFIG = {
  /**
   * Default zoom level
   */
  DEFAULT_ZOOM: 12,

  /**
   * Minimum zoom level
   */
  MIN_ZOOM: 2,

  /**
   * Maximum zoom level
   */
  MAX_ZOOM: 22,

  /**
   * Default center (NYC)
   */
  DEFAULT_CENTER: {
    latitude: 40.7128,
    longitude: -73.9352,
  },

  /**
   * Clustering zoom threshold
   * Below this zoom level, pins will be clustered
   */
  CLUSTERING_THRESHOLD: 12,
} as const;

/**
 * Mapbox API rate limits (for reference)
 * 
 * Free tier limits:
 * - Map loads: 50,000/month
 * - Geocoding: 100,000 requests/month
 * - Directions: 100,000 requests/month
 * 
 * Paid tier limits vary by plan.
 */
export const MAPBOX_RATE_LIMITS = {
  FREE_TIER: {
    MAP_LOADS: 50000, // per month
    GEOCODING: 100000, // per month
    DIRECTIONS: 100000, // per month
  },
} as const;

/**
 * Mapbox API documentation URLs
 */
export const MAPBOX_DOCS = {
  MOBILE_SDK_IOS: 'https://docs.mapbox.com/ios/maps/guides/',
  MOBILE_SDK_ANDROID: 'https://docs.mapbox.com/android/maps/guides/',
  GEOCODING_API: 'https://docs.mapbox.com/api/search/geocoding/',
  DIRECTIONS_API: 'https://docs.mapbox.com/api/navigation/directions/',
  STYLES: 'https://docs.mapbox.com/api/maps/styles/',
} as const;

/**
 * Export Mapbox configuration for mobile clients
 * 
 * This endpoint can be used to provide Mapbox config to mobile apps
 * without exposing the token in client-side code (if using token scoping).
 */
export function getMapboxConfig() {
  verifyMapboxToken();

  return {
    accessToken: MAPBOX_ACCESS_TOKEN,
    defaultStyle: DEFAULT_MAP_STYLE,
    defaultZoom: MAP_CONFIG.DEFAULT_ZOOM,
    minZoom: MAP_CONFIG.MIN_ZOOM,
    maxZoom: MAP_CONFIG.MAX_ZOOM,
    defaultCenter: MAP_CONFIG.DEFAULT_CENTER,
    clusteringThreshold: MAP_CONFIG.CLUSTERING_THRESHOLD,
  };
}

