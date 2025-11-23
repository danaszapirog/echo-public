# Phase 6: Caching Strategy for Map Endpoints

## Overview

This document outlines the caching strategy for Phase 6 map endpoints to optimize performance and reduce database load.

## Caching Requirements

### Map Pins Endpoint (`GET /api/v1/map/pins`)

**Cache Key Format:**
```
map_pins:{north}:{south}:{east}:{west}:{userId}:{includeNetwork}
```

**Cache TTL:** 5 minutes (300 seconds)

**Cache Invalidation:**
- When new spots are created
- When spots are deleted
- When playlists are published (if they affect map pins)
- When user follows/unfollows (affects network spots)

### Place Summary Endpoint (`GET /api/v1/places/:placeId/summary`)

**Cache Key Format:**
```
place_summary:{placeId}
```

**Cache TTL:** 10 minutes (600 seconds)

**Cache Invalidation:**
- When new spots are added for the place
- When spots are updated (rating changes)
- When spots are deleted

## Implementation Strategy

### Cache Service Integration

Use existing `cacheService` from `src/services/cacheService.ts`:

```typescript
import { cacheService } from '../services/cacheService';

// Cache key generation
function getMapPinsCacheKey(
  north: number,
  south: number,
  east: number,
  west: number,
  userId?: string,
  includeNetwork: boolean = true
): string {
  const parts = [
    'map_pins',
    north.toFixed(6),
    south.toFixed(6),
    east.toFixed(6),
    west.toFixed(6),
    userId || 'anonymous',
    includeNetwork ? 'network' : 'own',
  ];
  return parts.join(':');
}

// Cache retrieval
const cacheKey = getMapPinsCacheKey(north, south, east, west, userId);
const cached = await cacheService.get<MapPinsResponse>(cacheKey);

if (cached) {
  return cached;
}

// ... fetch from database ...

// Cache storage
await cacheService.set(cacheKey, result, { ttl: 300 }); // 5 minutes
```

### Cache Invalidation Patterns

#### Pattern 1: Invalidate on Spot Creation

```typescript
// In spotService.ts after creating spot
await cacheService.deletePattern('map_pins:*');
```

**Consideration:** This invalidates ALL map pins caches. More granular invalidation possible but complex.

#### Pattern 2: Invalidate on Follow/Unfollow

```typescript
// In followService.ts after follow/unfollow
// Only invalidate if user was viewing network spots
await cacheService.deletePattern(`map_pins:*:${userId}:network`);
```

#### Pattern 3: Invalidate Place Summary

```typescript
// In spotService.ts after spot operations
await cacheService.delete(`place_summary:${placeId}`);
```

## Cache Key Design

### Map Pins Cache Key Components

1. **Prefix:** `map_pins`
2. **Viewport:** `{north}:{south}:{east}:{west}` (6 decimal precision)
3. **User Context:** `{userId}` or `anonymous`
4. **Scope:** `network` or `own`

**Example:**
```
map_pins:40.748400:-73.985700:40.750000:-73.988100:user-123:network
```

### Normalization Strategy

**Viewport Coordinates:**
- Round to 6 decimal places (~0.1 meter precision)
- This allows slight viewport changes to reuse cache
- Balance between cache hit rate and accuracy

**Example:**
```typescript
function normalizeCoordinate(coord: number): number {
  return Math.round(coord * 1000000) / 1000000; // 6 decimal places
}
```

## Cache Warming Strategy

### Pre-warm Common Viewports

For MVP, skip cache warming. Consider for production:
- Pre-warm popular city viewports (NYC, LA, etc.)
- Pre-warm during off-peak hours
- Monitor cache hit rates

## Cache Size Management

### Memory Considerations

**Estimated Cache Size:**
- Map pins response: ~5-50 KB per viewport (depending on pin count)
- With 1000 cached viewports: ~5-50 MB
- Well within Redis memory limits

### Cache Eviction Policy

Redis default: `maxmemory-policy allkeys-lru`
- Automatically evicts least recently used keys
- No manual cache size management needed for MVP

## Performance Targets

### Cache Hit Rate Target
- **Goal:** 60-80% cache hit rate
- **Measurement:** Track cache hits vs misses
- **Optimization:** Adjust TTL based on hit rate

### Response Time Targets
- **Cached response:** < 50ms
- **Cache miss (DB query):** < 200ms
- **Overall average:** < 100ms

## Monitoring & Debugging

### Cache Metrics to Track

1. **Cache Hit Rate**
   ```typescript
   // Track in service
   const cacheHit = await cacheService.exists(cacheKey);
   if (cacheHit) {
     metrics.increment('map_pins.cache.hit');
   } else {
     metrics.increment('map_pins.cache.miss');
   }
   ```

2. **Cache Response Time**
   ```typescript
   const start = Date.now();
   const cached = await cacheService.get(cacheKey);
   const duration = Date.now() - start;
   metrics.timing('map_pins.cache.duration', duration);
   ```

3. **Cache Size**
   - Monitor Redis memory usage
   - Track number of cached keys: `KEYS map_pins:*`

### Debugging Cache Issues

**Check cache contents:**
```bash
redis-cli
> KEYS map_pins:*
> GET map_pins:40.748400:-73.985700:40.750000:-73.988100:user-123:network
> TTL map_pins:40.748400:-73.985700:40.750000:-73.988100:user-123:network
```

## Error Handling

### Graceful Degradation

```typescript
try {
  const cached = await cacheService.get(cacheKey);
  if (cached) return cached;
} catch (error) {
  console.error('Cache read error:', error);
  // Continue to database query
}

// ... database query ...

try {
  await cacheService.set(cacheKey, result, { ttl: 300 });
} catch (error) {
  console.error('Cache write error:', error);
  // Don't fail the request if cache write fails
}
```

**Principle:** Cache failures should never break the API. Always fall back to database.

## Implementation Checklist

- [ ] Implement cache key generation function
- [ ] Add cache retrieval in map pins endpoint
- [ ] Add cache storage after database query
- [ ] Implement cache invalidation on spot creation
- [ ] Implement cache invalidation on follow/unfollow
- [ ] Add cache metrics tracking
- [ ] Test cache hit/miss scenarios
- [ ] Test cache invalidation
- [ ] Monitor cache performance

---

**Last Updated:** Phase 6 Planning

