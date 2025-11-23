# Testing Strategy: Unit Tests vs Integration Tests

## Overview

We have **two types of tests**:
1. **Unit Tests** - Use mocks (fast, isolated, no external dependencies)
2. **Integration Tests** - Use real services (slower, test actual integrations)

---

## Unit Tests (Default)

**Command:** `npm test` or `npm run test:unit`

**Characteristics:**
- ✅ Fast execution
- ✅ No external API calls
- ✅ No rate limits
- ✅ Predictable results
- ✅ Can run offline
- ✅ Use mocks for external services

**What's Mocked:**
- Foursquare API → Returns mock place data
- AWS S3 → Simulates uploads/deletes
- Redis Cache → In-memory cache
- Prisma Database → Mock database calls

**Test Files:**
- `src/__tests__/*.test.ts` (all except integration folder)

**Example:**
```typescript
// Unit test - uses mocks
jest.mock('../services/foursquareService');
const places = await placeDataService.searchPlaces({ query: 'pizza' });
// Uses mock data, no real API call
```

---

## Integration Tests (Real Services)

**Command:** `npm run test:integration`

**Characteristics:**
- ⚠️ Slower execution (real network calls)
- ✅ Tests actual API integrations
- ⚠️ Requires valid API keys/credentials
- ⚠️ May hit rate limits
- ⚠️ Requires network connectivity
- ✅ Validates real-world behavior

**What's Real:**
- Foursquare API → Actual API calls
- AWS S3 → Real uploads/deletes
- Redis Cache → Real Redis connection
- Prisma Database → Real database queries

**Test Files:**
- `src/__tests__/integration/*.integration.test.ts`

**Example:**
```typescript
// Integration test - uses real services
// No jest.mock() calls
const places = await placeDataService.searchPlaces({ query: 'pizza' });
// Makes real API call to Foursquare
```

---

## When to Use Each

### Use Unit Tests For:
- ✅ Fast feedback during development
- ✅ Testing business logic
- ✅ Testing error handling
- ✅ Testing edge cases
- ✅ CI/CD pipelines (fast execution)
- ✅ Code coverage

### Use Integration Tests For:
- ✅ Validating API integrations work
- ✅ Testing before deployment
- ✅ Verifying API keys are valid
- ✅ Testing end-to-end flows
- ✅ Pre-production validation

---

## Running Tests

### Unit Tests (Default)
```bash
# Run all unit tests
npm test

# Run specific test file
npm test -- placeDataService.test.ts

# Run with coverage
npm run test:coverage
```

### Integration Tests
```bash
# Run all integration tests
npm run test:integration

# Run specific integration test
npm run test:integration -- placeDataService.integration.test.ts
```

**Note:** Integration tests will be skipped if:
- API keys are not configured
- Network is unavailable
- Services are unreachable

---

## Test Configuration

### Unit Tests Config
**File:** `jest.config.js`
- Uses mocks from `__mocks__` directory
- Fast execution
- No external dependencies

### Integration Tests Config
**File:** `jest.config.integration.js`
- Does NOT use mocks
- Uses real services
- Longer timeouts for network calls

---

## Environment Setup

### For Unit Tests
No special setup needed - mocks handle everything.

### For Integration Tests
Requires valid credentials in `.env`:

```bash
# Foursquare
FOURSQUARE_API_KEY=your-key-here

# AWS S3
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET_NAME=your-bucket

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

---

## Best Practices

1. **Write Unit Tests First**
   - Fast feedback
   - Test business logic
   - Use mocks

2. **Add Integration Tests for Critical Paths**
   - Validate real integrations
   - Test before deployment
   - Use real services

3. **Run Unit Tests Frequently**
   - Every code change
   - In CI/CD pipeline
   - Before commits

4. **Run Integration Tests Before Release**
   - Validate API keys
   - Test real integrations
   - Pre-production check

---

## Example: Testing Place Search

### Unit Test (Mocked)
```typescript
// src/__tests__/placeDataService.test.ts
jest.mock('../services/foursquareService');

it('should search places', async () => {
  (foursquareService.searchPlaces as jest.Mock).mockResolvedValue([
    { fsq_place_id: 'fsq_123', name: 'Mock Place', ... }
  ]);
  
  const places = await placeDataService.searchPlaces({ query: 'pizza' });
  expect(places).toHaveLength(1);
});
```

### Integration Test (Real API)
```typescript
// src/__tests__/integration/placeDataService.integration.test.ts
// No jest.mock() calls

it('should search places via real Foursquare API', async () => {
  const places = await placeDataService.searchPlaces({
    query: 'coffee',
    lat: 40.7128,
    lng: -74.0060,
  });
  
  expect(places).toBeDefined();
  expect(places.length).toBeGreaterThan(0);
}, 15000); // Longer timeout for real API
```

---

## Summary

| Aspect | Unit Tests | Integration Tests |
|--------|-----------|-------------------|
| **Speed** | Fast ⚡ | Slower 🐢 |
| **Mocks** | Yes ✅ | No ❌ |
| **Real APIs** | No ❌ | Yes ✅ |
| **Rate Limits** | No ✅ | Yes ⚠️ |
| **Offline** | Yes ✅ | No ❌ |
| **CI/CD** | Yes ✅ | Optional ⚠️ |
| **Use Case** | Development | Pre-deployment |

---

## Next Steps

1. ✅ Unit tests with mocks - **COMPLETE**
2. ✅ Integration test examples - **CREATED**
3. ⏭️ Add more integration tests as needed
4. ⏭️ Set up CI/CD to run both test types

---

**You can test both ways:**
- **Unit tests** = Fast, mocked, for development
- **Integration tests** = Real APIs, for validation

Both are important! 🎯

