# Phase 7 Testing Instructions

## Quick Start

### 1. Start Required Services

```bash
# Terminal 1: Start PostgreSQL (if using Docker Compose)
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
npm test -- onboarding.test.ts
```

**Expected:** All 7 tests passing ✅

---

### 3. Run Integration Tests

```bash
cd backend
./test-phase7.sh
```

This will test:
- ✅ Launch creators endpoint (public)
- ✅ Onboarding completion endpoint
- ✅ Validation and error handling
- ✅ User search verification badges

---

## Manual Testing

If you prefer to test manually, see `PHASE7_TEST_GUIDE.md` for detailed API endpoint testing instructions.

---

## What to Test

### ✅ Unit Tests (Automated)
- [x] Onboarding controller tests (7 tests)

### 🔍 Integration Tests (Automated Script)
- [ ] Launch creators endpoint - public access
- [ ] Launch creators endpoint - returns data
- [ ] Onboarding completion - creates follows
- [ ] Onboarding completion - validation errors
- [ ] Onboarding completion - unauthorized
- [ ] User search - includes is_verified
- [ ] User profile - includes is_verified
- [ ] Admin endpoint - make creator (if configured)

---

## Test Results

After running tests, check:
1. **Unit Tests:** Should show "7 passed"
2. **Integration Tests:** Script will show pass/fail for each test
3. **Manual Tests:** Follow guide in `PHASE7_TEST_GUIDE.md`

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

### No Creators Found
```bash
# Creators need to be created via admin endpoint or database
# They must have:
# - role = 'creator'
# - isVerified = true
# - isPrivate = false
```

### Admin Endpoint Not Working
```bash
# Set ADMIN_USER_IDS in .env file
# Format: ADMIN_USER_IDS=uuid1,uuid2,uuid3
# Then restart server
```

---

## Next Steps

Once all tests pass:
1. Review test results
2. Document any issues
3. Proceed to Phase 8 or fix any bugs found

