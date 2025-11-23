# Phase 6 Testing Instructions

## Quick Start

### 1. Start Required Services

```bash
# Terminal 1: Start PostgreSQL and Redis (if using Docker Compose)
cd backend
docker-compose up -d

# Terminal 2: Start the backend server
cd backend
npm run dev
```

Wait for server to start (you should see "🚀 Server running on port 3000")

---

### 2. Run Unit Tests (Already Passing ✅)

```bash
cd backend
npm test -- map.test.ts mapService.test.ts placeSummary.test.ts
```

**Expected:** All 21 tests passing ✅

---

### 3. Run Integration Tests

```bash
cd backend
./test-phase6.sh
```

This will test:
- ✅ Map pins endpoint with various parameters
- ✅ Clustering at different zoom levels
- ✅ Place summary endpoint
- ✅ Validation and error handling
- ✅ Rate limiting
- ✅ Caching behavior

---

## Manual Testing

If you prefer to test manually, see `PHASE6_TEST_GUIDE.md` for detailed API endpoint testing instructions.

---

## What to Test

### ✅ Unit Tests (Automated)
- [x] Map controller tests (10 tests)
- [x] Map service tests (8 tests)
- [x] Place summary tests (5 tests)

### 🔍 Integration Tests (Automated Script)
- [ ] Map pins endpoint - basic request
- [ ] Map pins endpoint - with clustering (low zoom)
- [ ] Map pins endpoint - high zoom (no clustering)
- [ ] Map pins endpoint - exclude network spots
- [ ] Map pins endpoint - validation errors
- [ ] Map pins endpoint - unauthorized
- [ ] Place summary endpoint - authenticated
- [ ] Place summary endpoint - unauthenticated
- [ ] Place summary endpoint - invalid place ID
- [ ] Rate limiting (30 req/min)
- [ ] Caching behavior

---

## Test Results

After running tests, check:
1. **Unit Tests:** Should show "21 passed"
2. **Integration Tests:** Script will show pass/fail for each test
3. **Manual Tests:** Follow guide in `PHASE6_TEST_GUIDE.md`

---

## Common Issues

### Server Not Running
```bash
# Check if server is running
curl http://localhost:3000/health

# If not, start it
cd backend
npm run dev
```

### Database Not Connected
```bash
# Check PostgreSQL is running
docker-compose ps

# Or check local PostgreSQL
psql -d echo_dev -c "SELECT 1;"
```

### Redis Not Connected
```bash
# Check Redis is running
docker-compose ps

# Or check local Redis
redis-cli ping
# Should return: PONG
```

---

## Next Steps

Once all tests pass:
1. Review test results
2. Document any issues
3. Proceed to Phase 7 or fix any bugs found

