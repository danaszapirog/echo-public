# Mock Services Setup Guide

## Overview

This document describes the mock services available for testing external dependencies (Foursquare, AWS S3, Redis) before Phase 8.

---

## Available Mocks

### 1. Foursquare Service Mock
**Location:** `src/__mocks__/foursquareService.ts`

**Mock Data:**
- 3 sample places (Joe's Pizza, Blue Bottle Coffee, Central Park)
- Mock search results
- Mock place details

**Usage in Tests:**
```typescript
jest.mock('../services/foursquareService');

// Mock will return predefined places
const places = await foursquareService.searchPlaces({ query: 'pizza' });
```

---

### 2. AWS S3 Mock
**Location:** `src/__mocks__/s3.ts`

**Mock Features:**
- Mock S3 client with `send` method
- Mock bucket name and CloudFront domain
- Returns mock ETag and VersionId

**Usage in Tests:**
```typescript
jest.mock('../config/s3');

// Mock S3 upload
(s3Client.send as jest.Mock).mockResolvedValue({
  ETag: '"mock-etag"',
});
```

---

### 3. Image Service Mock
**Location:** `src/__mocks__/imageService.ts`

**Mock Features:**
- Mock upload result with URL and key
- Mock delete operation
- Mock S3 key extraction

**Usage in Tests:**
```typescript
jest.mock('../services/imageService');

const result = await uploadImage(mockFile, 'avatars');
// Returns: { url: 'https://test-cloudfront.net/avatars/mock-uuid.jpg', key: 'avatars/mock-uuid.jpg' }
```

---

### 4. Cache Service Mock
**Location:** `src/__mocks__/cacheService.ts`

**Mock Features:**
- In-memory cache (Map-based)
- TTL support
- Automatic expiration

**Usage in Tests:**
```typescript
jest.mock('../services/cacheService');

// Mock cache get/set
(cacheService.get as jest.Mock).mockResolvedValue(null);
(cacheService.set as jest.Mock).mockResolvedValue(undefined);
```

---

### 5. Place Data Service Mock
**Location:** `src/__mocks__/placeDataService.ts`

**Mock Features:**
- Mock place search results
- Mock place details
- Predefined test data

**Usage in Tests:**
```typescript
jest.mock('../services/placeDataService');

const places = await placeDataService.searchPlaces({ query: 'pizza' });
```

---

## Example Test Files

### Place Data Service Test
**File:** `src/__tests__/placeDataService.test.ts`

Tests:
- ✅ Search places via Foursquare
- ✅ Cached place retrieval
- ✅ Fetch from Foursquare if not cached
- ✅ Error handling

### Image Service Test
**File:** `src/__tests__/imageService.test.ts`

Tests:
- ✅ Upload image to S3
- ✅ Delete image from S3
- ✅ Extract S3 key from URL
- ✅ CloudFront vs S3 URL handling

---

## How to Use Mocks

### Option 1: Manual Mocking in Test Files

```typescript
// At the top of your test file
jest.mock('../services/foursquareService');
jest.mock('../services/cacheService');

import { foursquareService } from '../services/foursquareService';
import { cacheService } from '../services/cacheService';

describe('My Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (cacheService.get as jest.Mock).mockResolvedValue(null);
  });

  it('should work with mocks', async () => {
    (foursquareService.searchPlaces as jest.Mock).mockResolvedValue([
      { fsq_place_id: 'fsq_123', name: 'Test Place', ... }
    ]);

    // Your test code here
  });
});
```

### Option 2: Use Jest Auto-Mocking

Jest will automatically use mocks from `__mocks__` directory when you call `jest.mock()`.

---

## Benefits of Mocks

1. **Faster Tests:** No network calls to external APIs
2. **Reliable:** Tests don't depend on external service availability
3. **No Rate Limits:** Can run unlimited tests without hitting API limits
4. **Predictable:** Mock data is consistent across test runs
5. **Error Testing:** Easy to test error scenarios

---

## Mock Data

### Foursquare Places
- **Joe's Pizza:** Pizza Place in NYC
- **Blue Bottle Coffee:** Coffee Shop in NYC
- **Central Park:** Park in NYC

### S3 Upload Results
- Mock URLs use `test-cloudfront.net` domain
- Mock keys follow pattern: `{folder}/{uuid}.{ext}`

---

## Running Tests with Mocks

```bash
# Run all tests (mocks will be used automatically)
npm test

# Run specific test file
npm test -- placeDataService.test.ts

# Run with coverage
npm test -- --coverage
```

---

## Next Steps

1. ✅ Mocks created for Foursquare, S3, Image Service, Cache Service
2. ✅ Example test files created
3. ⏭️ Add more mock data as needed
4. ⏭️ Create integration tests using mocks
5. ⏭️ Set up test coverage reporting

---

## References

- Jest Mocking: https://jestjs.io/docs/mock-functions
- Manual Mocks: https://jestjs.io/docs/manual-mocks

