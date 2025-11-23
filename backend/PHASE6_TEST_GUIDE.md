# Phase 6 Testing Guide

## Overview
This guide covers testing all Phase 6 features: Map Pins API, Pin Clustering, Place Summary Cards, Rate Limiting, and Caching.

---

## Prerequisites

1. **Server Running:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Database & Redis Running:**
   - PostgreSQL should be running (via Docker Compose or local)
   - Redis should be running (via Docker Compose or local)

3. **Test Tools:**
   - `curl` (command line)
   - `jq` (optional, for JSON formatting)
   - Or use Postman/Insomnia

---

## Test 1: Unit Tests ✅

Run the unit tests first to verify basic functionality:

```bash
cd backend
npm test -- map.test.ts mapService.test.ts placeSummary.test.ts
```

**Expected:** All 21 tests passing

---

## Test 2: Integration Tests (API Endpoints)

### Step 1: Start the Server

```bash
cd backend
npm run dev
```

### Step 2: Run Automated Test Script

```bash
cd backend
./test-phase6.sh
```

This script will:
- Register a test user
- Test all map pins endpoints
- Test place summary endpoints
- Test validation and error cases
- Test rate limiting (if applicable)
- Test caching behavior

---

## Test 3: Manual API Testing

### Authentication

First, register/login to get an access token:

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maptest@example.com",
    "password": "TestPassword123!",
    "username": "maptestuser"
  }'

# Extract access_token from response
```

---

### Test 3.1: Map Pins Endpoint - Basic Request

```bash
curl -X GET "http://localhost:3000/api/v1/map/pins?north=40.8&south=40.7&east=-73.9&west=-74.0" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "pins": [
    {
      "place_id": "uuid",
      "latitude": 40.7282,
      "longitude": -73.9942,
      "pin_type": "spot",
      "spot_count": 2
    }
  ],
  "clusters": []
}
```

**Verify:**
- ✅ Returns `pins` array
- ✅ Returns `clusters` array
- ✅ Each pin has: `place_id`, `latitude`, `longitude`, `pin_type`, `spot_count`

---

### Test 3.2: Map Pins Endpoint - With Clustering (Low Zoom)

```bash
curl -X GET "http://localhost:3000/api/v1/map/pins?north=40.8&south=40.7&east=-73.9&west=-74.0&zoom=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "pins": [...],
  "clusters": [
    {
      "latitude": 40.7282,
      "longitude": -73.9942,
      "count": 5
    }
  ]
}
```

**Verify:**
- ✅ At zoom < 12, clusters are returned
- ✅ Clusters have `latitude`, `longitude`, `count`
- ✅ Pins that are part of clusters are filtered out

---

### Test 3.3: Map Pins Endpoint - High Zoom (No Clustering)

```bash
curl -X GET "http://localhost:3000/api/v1/map/pins?north=40.8&south=40.7&east=-73.9&west=-74.0&zoom=15" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Verify:**
- ✅ At zoom >= 12, no clusters returned (or empty clusters array)
- ✅ All pins returned individually

---

### Test 3.4: Map Pins Endpoint - Exclude Network Spots

```bash
curl -X GET "http://localhost:3000/api/v1/map/pins?north=40.8&south=40.7&east=-73.9&west=-74.0&include_network=false" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Verify:**
- ✅ Only user's own spots and want-to-go items returned
- ✅ No network spots included

---

### Test 3.5: Map Pins Endpoint - Validation Errors

**Missing Viewport Parameters:**
```bash
curl -X GET "http://localhost:3000/api/v1/map/pins" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected:** 400 Bad Request with error message

**Invalid Viewport (north <= south):**
```bash
curl -X GET "http://localhost:3000/api/v1/map/pins?north=40.7&south=40.8&east=-73.9&west=-74.0" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected:** 400 Bad Request - "North must be greater than south"

**Invalid Viewport (east <= west):**
```bash
curl -X GET "http://localhost:3000/api/v1/map/pins?north=40.8&south=40.7&east=-74.0&west=-73.9" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected:** 400 Bad Request - "East must be greater than west"

---

### Test 3.6: Map Pins Endpoint - Unauthorized

```bash
curl -X GET "http://localhost:3000/api/v1/map/pins?north=40.8&south=40.7&east=-73.9&west=-74.0"
```

**Expected:** 401 Unauthorized

---

### Test 3.7: Place Summary Endpoint

First, get a place ID (search for a place or use existing):

```bash
# Search for a place
curl -X GET "http://localhost:3000/api/v1/places/search?q=coffee&lat=40.7128&lng=-74.0060&limit=1"

# Get place details to get internal UUID
curl -X GET "http://localhost:3000/api/v1/places/PLACE_ID"
```

Then get summary:

```bash
curl -X GET "http://localhost:3000/api/v1/places/PLACE_ID/summary" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "place_id": "uuid",
  "name": "Joe's Pizza",
  "primary_category": "Pizza Place",
  "network_spot_count": 5,
  "average_rating": 4.6,
  "common_tags": ["pizza", "classic"]
}
```

**Verify:**
- ✅ Returns place name and category
- ✅ Returns network spot count (from followed users)
- ✅ Returns average rating (rounded to 1 decimal)
- ✅ Returns common tags (top 5, appearing in at least 2 spots)

---

### Test 3.8: Place Summary Endpoint - Without Authentication

```bash
curl -X GET "http://localhost:3000/api/v1/places/PLACE_ID/summary"
```

**Verify:**
- ✅ Works without authentication (optional auth)
- ✅ Returns summary with 0 network spots if not authenticated

---

### Test 3.9: Place Summary Endpoint - Invalid Place ID

```bash
curl -X GET "http://localhost:3000/api/v1/places/invalid-place-id/summary" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected:** 404 Not Found

---

### Test 3.10: Rate Limiting

Make 35 requests rapidly (limit is 30/min):

```bash
for i in {1..35}; do
  curl -X GET "http://localhost:3000/api/v1/map/pins?north=40.8&south=40.7&east=-73.9&west=-74.0" \
    -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
    -w "\n%{http_code}\n"
  sleep 0.1
done
```

**Verify:**
- ✅ First 30 requests succeed (200 OK)
- ✅ Request 31+ returns 429 Too Many Requests
- ✅ Rate limit headers present (`X-RateLimit-Limit`, `X-RateLimit-Remaining`)

---

### Test 3.11: Caching

Make two identical requests and compare response times:

```bash
# First request
time curl -X GET "http://localhost:3000/api/v1/map/pins?north=40.8&south=40.7&east=-73.9&west=-74.0" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" > /dev/null

# Second request (should be faster if cached)
time curl -X GET "http://localhost:3000/api/v1/map/pins?north=40.8&south=40.7&east=-73.9&west=-74.0" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" > /dev/null
```

**Verify:**
- ✅ Second request is faster (cached response)
- ✅ Cache expires after 5 minutes

---

## Test 4: Database Index Verification

Check that geospatial indexes were created:

```bash
# Connect to PostgreSQL
psql -d echo_dev

# Check indexes
\d places

# Should see: places_latitude_longitude_idx
```

---

## Test 5: End-to-End Scenario

### Scenario: User views map with pins and clusters

1. **User A creates spots at multiple places**
2. **User B follows User A**
3. **User B views map at low zoom**
   - Should see clusters
   - Should see network spots from User A
4. **User B zooms in**
   - Should see individual pins
   - No clusters
5. **User B clicks on a place**
   - Should see place summary with network stats

---

## Expected Test Results Summary

### Unit Tests
- ✅ 21 tests passing
- ✅ Controller tests: 10 tests
- ✅ Service tests: 8 tests
- ✅ Place summary tests: 5 tests

### Integration Tests
- ✅ Map pins endpoint returns data
- ✅ Clustering works at low zoom
- ✅ No clustering at high zoom
- ✅ Network spots included/excluded correctly
- ✅ Validation errors handled correctly
- ✅ Authentication required
- ✅ Place summary returns correct data
- ✅ Rate limiting works
- ✅ Caching works

---

## Troubleshooting

### Issue: "Unauthorized" errors
- **Solution:** Make sure you're including the `Authorization: Bearer TOKEN` header
- **Check:** Token hasn't expired (15 minutes)

### Issue: No pins returned
- **Solution:** Create some spots/want-to-go items first
- **Check:** Viewport coordinates are valid

### Issue: Rate limiting not working
- **Solution:** Check Redis is running
- **Check:** Rate limiter middleware is applied to routes

### Issue: Caching not working
- **Solution:** Check Redis is running
- **Check:** Cache keys are being generated correctly

---

## Test Checklist

- [ ] Unit tests pass (21 tests)
- [ ] Map pins endpoint returns data
- [ ] Clustering works at zoom < 12
- [ ] No clustering at zoom >= 12
- [ ] Network spots can be excluded
- [ ] Validation errors work correctly
- [ ] Authentication required
- [ ] Place summary endpoint works
- [ ] Place summary works without auth
- [ ] Rate limiting works (30 req/min)
- [ ] Caching works (5 min TTL)
- [ ] Database indexes created
- [ ] End-to-end scenario works

---

## Next Steps

After Phase 6 testing is complete:
1. Document any issues found
2. Fix any bugs
3. Proceed to Phase 7: Advanced Discovery Features

