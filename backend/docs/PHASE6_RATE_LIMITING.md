# Phase 6: Rate Limiting Strategy

## Overview

This document outlines the rate limiting strategy for Phase 6 map endpoints, which will be called frequently as users pan and zoom the map.

## Rate Limiting Requirements

### Map Endpoints

**High-Frequency Endpoints:**
- `GET /api/v1/map/pins` - Called on every map pan/zoom
- `GET /api/v1/places/:placeId/summary` - Called when clicking pins

**Characteristics:**
- Called very frequently (multiple times per second during map interaction)
- Need higher limits than other endpoints
- Should not block normal map usage
- Need to prevent abuse

## Rate Limiting Strategy

### Library Choice

**Recommended:** `express-rate-limit`

**Installation:**
```bash
npm install express-rate-limit
npm install --save-dev @types/express-rate-limit
```

**Alternative:** `rate-limiter-flexible` (more features, more complex)

### Rate Limit Configuration

#### Map Pins Endpoint (`GET /api/v1/map/pins`)

**Configuration:**
```typescript
import rateLimit from 'express-rate-limit';

const mapPinsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 60, // 60 requests per minute (1 per second average)
  message: 'Too many map requests, please try again later',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skipSuccessfulRequests: false, // Count all requests
  skipFailedRequests: false, // Count failed requests too
});
```

**Rationale:**
- 60 requests/minute = 1 request/second average
- Allows smooth map panning/zooming
- Prevents abuse while allowing normal usage
- Window: 1 minute (resets quickly)

#### Place Summary Endpoint (`GET /api/v1/places/:placeId/summary`)

**Configuration:**
```typescript
const placeSummaryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 30, // 30 requests per minute
  message: 'Too many place requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
```

**Rationale:**
- Less frequent than map pins (only on pin clicks)
- 30 requests/minute is sufficient for normal usage
- Prevents rapid clicking abuse

### Authentication-Based Limits

**Different limits for authenticated vs unauthenticated:**

```typescript
const createMapLimiter = (max: number) => {
  return rateLimit({
    windowMs: 60 * 1000,
    max,
    keyGenerator: (req) => {
      // Use user ID if authenticated, IP if not
      return req.user?.userId || req.ip;
    },
    message: 'Too many map requests, please try again later',
    standardHeaders: true,
  });
};

// Authenticated users get higher limits
const mapPinsLimiter = createMapLimiter(60); // 60/min for authenticated
const mapPinsLimiterAnonymous = createMapLimiter(30); // 30/min for anonymous
```

### Implementation

#### Middleware Setup

```typescript
// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const mapPinsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: {
    error: 'Too many map requests',
    message: 'Please wait a moment before requesting map data again',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use user ID if authenticated, IP if not
  keyGenerator: (req) => {
    return req.user?.userId || req.ip || 'unknown';
  },
});

export const placeSummaryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: {
    error: 'Too many place requests',
    message: 'Please wait a moment before requesting place data again',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.userId || req.ip || 'unknown';
  },
});
```

#### Route Integration

```typescript
// src/routes/mapRoutes.ts
import { mapPinsLimiter, placeSummaryLimiter } from '../middleware/rateLimiter';

router.get('/pins', mapPinsLimiter, getMapPinsHandler);
router.get('/places/:placeId/summary', placeSummaryLimiter, getPlaceSummaryHandler);
```

## Rate Limit Headers

### Response Headers

Rate limit middleware will add headers:
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Remaining requests in window
- `RateLimit-Reset`: Time when limit resets (Unix timestamp)

### Client Handling

Mobile clients should:
- Monitor `RateLimit-Remaining` header
- Implement exponential backoff when limit approached
- Show user-friendly message when rate limited
- Cache responses to reduce API calls

## Redis-Based Rate Limiting (Optional)

### For Distributed Systems

If running multiple backend instances, use Redis-based rate limiting:

```typescript
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redis } from '../config/redis';

const mapPinsLimiterRedis = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl_map_pins',
  points: 60, // 60 requests
  duration: 60, // per 60 seconds
});
```

**Benefits:**
- Shared rate limit across all instances
- More accurate for distributed systems
- Requires Redis (already available)

**For MVP:** In-memory rate limiting is sufficient (single instance)

## Monitoring & Alerting

### Metrics to Track

1. **Rate Limit Hits**
   - Count of 429 responses
   - Per endpoint
   - Per user/IP

2. **Rate Limit Effectiveness**
   - Requests blocked vs allowed
   - Patterns of abuse

3. **User Impact**
   - Users hitting rate limits
   - Frequency of rate limit hits

### Alerting

- Alert if rate limit hit rate > 5% of requests
- Alert if specific IP/user hitting limits repeatedly
- Monitor for DDoS patterns

## Testing Rate Limits

### Test Script

```typescript
// Test rate limiting
const testRateLimit = async () => {
  const baseUrl = 'http://localhost:3000/api/v1';
  const endpoint = '/map/pins';
  
  // Make 70 requests (should fail after 60)
  for (let i = 0; i < 70; i++) {
    const response = await fetch(`${baseUrl}${endpoint}?north=40.8&south=40.7&east=-73.9&west=-74.0`);
    console.log(`Request ${i + 1}: ${response.status}`);
    
    if (response.status === 429) {
      console.log('Rate limit hit!');
      const reset = response.headers.get('RateLimit-Reset');
      console.log(`Reset at: ${new Date(parseInt(reset || '0') * 1000)}`);
      break;
    }
  }
};
```

## Configuration Tuning

### Adjusting Limits

**If users complain about limits:**
- Increase `max` value
- Increase `windowMs` (longer window)
- Implement per-user limits (authenticated users get more)

**If seeing abuse:**
- Decrease `max` value
- Decrease `windowMs` (shorter window)
- Implement stricter limits for anonymous users

### Environment-Based Limits

```typescript
const getMapPinsLimit = () => {
  if (process.env.NODE_ENV === 'production') {
    return 60; // Production limit
  }
  return 120; // Development limit (more lenient)
};
```

## Implementation Checklist

- [ ] Install `express-rate-limit` package
- [ ] Create rate limiter middleware file
- [ ] Configure map pins rate limiter (60/min)
- [ ] Configure place summary rate limiter (30/min)
- [ ] Apply rate limiters to map routes
- [ ] Test rate limiting with multiple requests
- [ ] Verify rate limit headers in responses
- [ ] Document rate limits in API documentation
- [ ] Set up monitoring for rate limit hits
- [ ] Tune limits based on usage patterns

---

**Last Updated:** Phase 6 Planning

