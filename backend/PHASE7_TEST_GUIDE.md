# Phase 7 Testing Guide

## Overview
This guide covers testing all Phase 7 features: Onboarding endpoints, Creator management, and Admin tools.

---

## Prerequisites

1. **Server Running:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Database Running:**
   - PostgreSQL should be running (via Docker Compose or local)

3. **Test Tools:**
   - `curl` (command line)
   - `jq` (optional, for JSON formatting)
   - Or use Postman/Insomnia

---

## Test 1: Unit Tests ✅

Run the unit tests first to verify basic functionality:

```bash
cd backend
npm test -- onboarding.test.ts
```

**Expected:** All 7 tests passing

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
./test-phase7.sh
```

This script will:
- Register a test user
- Test launch creators endpoint
- Test onboarding completion endpoint
- Test validation and error cases
- Test user search for verification badges

---

## Test 3: Manual API Testing

### Authentication

First, register/login to get an access token:

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "username": "testuser"
  }'

# Extract access_token from response
```

---

### Test 3.1: Get Launch Creators (Public Endpoint)

```bash
curl -X GET "http://localhost:3000/api/v1/onboarding/creators"
```

**Expected Response:**
```json
{
  "creators": [
    {
      "id": "uuid",
      "username": "creator1",
      "bio": "Food blogger",
      "profile_picture_url": "https://...",
      "playlist_count": 5,
      "is_verified": true
    }
  ],
  "count": 1
}
```

**Verify:**
- ✅ Returns `creators` array
- ✅ Returns `count` field
- ✅ Each creator has: `id`, `username`, `bio`, `profile_picture_url`, `playlist_count`, `is_verified`
- ✅ Works without authentication (public endpoint)

---

### Test 3.2: Complete Onboarding

```bash
curl -X POST "http://localhost:3000/api/v1/onboarding/complete" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "followed_creator_ids": ["uuid1", "uuid2", "uuid3"]
  }'
```

**Expected Response:**
```json
{
  "message": "Onboarding completed successfully",
  "onboarding_completed_at": "2024-01-15T10:00:00Z"
}
```

**Verify:**
- ✅ Creates follow relationships for each creator
- ✅ Marks onboarding as complete
- ✅ Returns success message with timestamp

---

### Test 3.3: Complete Onboarding - Validation Errors

**Empty Creator IDs:**
```bash
curl -X POST "http://localhost:3000/api/v1/onboarding/complete" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"followed_creator_ids": []}'
```

**Expected:** 400 Bad Request with validation error

**Invalid Creator IDs:**
```bash
curl -X POST "http://localhost:3000/api/v1/onboarding/complete" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"followed_creator_ids": ["invalid-id"]}'
```

**Expected:** 400 Bad Request - "One or more creator IDs are invalid"

**Too Many Creator IDs:**
```bash
# Create array with 21 IDs (limit is 20)
curl -X POST "http://localhost:3000/api/v1/onboarding/complete" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"followed_creator_ids": ["uuid1", "uuid2", ...]}' # 21 IDs
```

**Expected:** 400 Bad Request - validation error

---

### Test 3.4: Complete Onboarding - Unauthorized

```bash
curl -X POST "http://localhost:3000/api/v1/onboarding/complete" \
  -H "Content-Type: application/json" \
  -d '{"followed_creator_ids": ["uuid1"]}'
```

**Expected:** 401 Unauthorized

---

### Test 3.5: User Search - Verification Badge

```bash
curl -X GET "http://localhost:3000/api/v1/users/search?q=creator&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "users": [
    {
      "id": "uuid",
      "username": "creator1",
      "profile_picture_url": "https://...",
      "role": "creator",
      "is_verified": true
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

**Verify:**
- ✅ Response includes `is_verified` field
- ✅ Creators show `is_verified: true`
- ✅ Regular users show `is_verified: false`

---

### Test 3.6: User Profile - Verification Badge

```bash
curl -X GET "http://localhost:3000/api/v1/users/USER_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Verify:**
- ✅ Response includes `is_verified` field
- ✅ Verified creators show `is_verified: true`

---

### Test 3.7: Admin Endpoint - Make Creator

**Prerequisites:**
- Set `ADMIN_USER_IDS` in `.env` file (comma-separated list of admin user IDs)
- Use an admin user's access token

```bash
curl -X POST "http://localhost:3000/api/v1/admin/users/USER_ID/make-creator" \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "message": "User successfully assigned creator role",
  "user_id": "uuid"
}
```

**Verify:**
- ✅ User role changed to "creator"
- ✅ User isVerified set to true
- ✅ User isPrivate set to false (creators must be public)
- ✅ Returns 403 Forbidden if not admin

---

### Test 3.8: Admin Endpoint - Unauthorized

```bash
curl -X POST "http://localhost:3000/api/v1/admin/users/USER_ID/make-creator" \
  -H "Authorization: Bearer NON_ADMIN_TOKEN"
```

**Expected:** 403 Forbidden - "Admin access required"

---

### Test 3.9: Creator Public Profile Enforcement

**Test 1: Creator Cannot Set Private Profile**
```bash
# First, make user a creator (via admin endpoint)
# Then try to update profile to private
curl -X PATCH "http://localhost:3000/api/v1/users/me" \
  -H "Authorization: Bearer CREATOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"is_private": true}'
```

**Expected:** Profile remains public (isPrivate = false) even if request sets it to true

**Test 2: Admin Assignment Sets Public Profile**
```bash
# Make user a creator via admin endpoint
# Check user profile
curl -X GET "http://localhost:3000/api/v1/users/USER_ID" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Verify:**
- ✅ `is_private` is false
- ✅ `role` is "creator"
- ✅ `is_verified` is true

---

## Test 4: Database Verification

Check that new fields were added:

```bash
# Connect to PostgreSQL
psql -d echo_dev

# Check user table structure
\d users

# Should see:
# - is_featured (boolean)
# - onboarding_completed_at (timestamp)
```

---

## Test 5: End-to-End Scenario

### Scenario: New User Onboarding Flow

1. **User registers**
   ```bash
   POST /api/v1/auth/register
   ```

2. **User views launch creators**
   ```bash
   GET /api/v1/onboarding/creators
   ```
   - Should see list of verified creators
   - Should see playlist counts

3. **User selects creators to follow**
   - User chooses 3 creators from the list

4. **User completes onboarding**
   ```bash
   POST /api/v1/onboarding/complete
   {
     "followed_creator_ids": ["uuid1", "uuid2", "uuid3"]
   }
   ```
   - Should create follow relationships
   - Should mark onboarding as complete

5. **Verify onboarding completed**
   ```bash
   GET /api/v1/users/me
   ```
   - Check `onboarding_completed_at` field is set

---

## Expected Test Results Summary

### Unit Tests
- ✅ 7 tests passing
- ✅ Controller tests cover all scenarios

### Integration Tests
- ✅ Launch creators endpoint returns data
- ✅ Launch creators works without authentication
- ✅ Onboarding completion creates follows
- ✅ Validation errors handled correctly
- ✅ Authentication required for completion
- ✅ User search includes verification badges
- ✅ Admin endpoint works (if configured)
- ✅ Creator public profile enforced

---

## Troubleshooting

### Issue: No creators returned
- **Solution:** Create some users with role='creator' and isVerified=true
- **Check:** Users must have isPrivate=false (creators must be public)

### Issue: Admin endpoint returns 403
- **Solution:** Set ADMIN_USER_IDS in .env file
- **Check:** User ID must be in the comma-separated list

### Issue: Onboarding completion fails
- **Solution:** Ensure creator IDs are valid verified creators
- **Check:** Creators must have role='creator' and isVerified=true

---

## Test Checklist

- [ ] Unit tests pass (7 tests)
- [ ] Launch creators endpoint returns data
- [ ] Launch creators works without auth
- [ ] Onboarding completion works
- [ ] Validation errors work correctly
- [ ] Authentication required
- [ ] User search includes is_verified
- [ ] User profile includes is_verified
- [ ] Admin endpoint works (if configured)
- [ ] Creator public profile enforced
- [ ] Database fields created
- [ ] End-to-end scenario works

---

## Next Steps

After Phase 7 testing is complete:
1. Document any issues found
2. Fix any bugs
3. Proceed to Phase 8: Mobile App Development (iOS)

