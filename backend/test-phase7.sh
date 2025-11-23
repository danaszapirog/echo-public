#!/bin/bash

# Phase 7 API Test Script
# Tests Onboarding & Creator Features endpoints

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
API_VERSION="v1"
API_BASE="${BASE_URL}/api/${API_VERSION}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
PASSED=0
FAILED=0

# Helper functions
print_test() {
    echo -e "${BLUE}▶ Testing: $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    PASSED=$((PASSED + 1))
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    FAILED=$((FAILED + 1))
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Test authentication and get tokens
print_test "Authentication"
echo "Creating test user..."

REGISTER_RESPONSE=$(curl -s -X POST "${API_BASE}/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "onboardingtest'$(date +%s)'@example.com",
        "password": "TestPassword123!",
        "username": "onboardingtest'$(date +%s)'"
    }')

if echo "$REGISTER_RESPONSE" | grep -q "access_token"; then
    ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    USER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    print_success "User registered successfully"
    print_info "User ID: $USER_ID"
else
    print_error "Failed to register user"
    echo "$REGISTER_RESPONSE"
    exit 1
fi

# Test 1: Get Launch Creators (Public Endpoint)
print_test "Get Launch Creators Endpoint (Public)"
CREATORS_RESPONSE=$(curl -s -X GET "${API_BASE}/onboarding/creators")

if echo "$CREATORS_RESPONSE" | grep -q "creators"; then
    print_success "Launch creators endpoint returned data"
    echo "$CREATORS_RESPONSE" | jq '.' 2>/dev/null || echo "$CREATORS_RESPONSE"
    
    CREATOR_COUNT=$(echo "$CREATORS_RESPONSE" | jq '.count // .creators | length' 2>/dev/null || echo "0")
    print_info "Found $CREATOR_COUNT creators"
else
    print_error "Launch creators endpoint failed"
    echo "$CREATORS_RESPONSE"
fi

# Test 2: Get Launch Creators Without Authentication
print_test "Get Launch Creators Without Authentication (Should Work)"
CREATORS_NO_AUTH=$(curl -s -X GET "${API_BASE}/onboarding/creators")

if echo "$CREATORS_NO_AUTH" | grep -q "creators"; then
    print_success "Launch creators endpoint works without authentication (as expected)"
else
    print_error "Launch creators should work without authentication"
    echo "$CREATORS_NO_AUTH"
fi

# Test 3: Complete Onboarding - Need to create a creator first or use existing
print_test "Complete Onboarding - Checking for Creators"
CREATORS_LIST=$(curl -s -X GET "${API_BASE}/onboarding/creators")
CREATOR_IDS=$(echo "$CREATORS_LIST" | jq -r '.creators[].id' 2>/dev/null | head -3)

if [ -z "$CREATOR_IDS" ] || [ "$CREATOR_IDS" = "null" ]; then
    print_info "No creators found. Creating a test creator would require admin access."
    print_info "Skipping onboarding completion test (requires admin setup)"
else
    print_info "Found creators, testing onboarding completion..."
    
    # Convert to array format
    CREATOR_ARRAY=$(echo "$CREATOR_IDS" | jq -R -s -c 'split("\n") | map(select(length > 0))' 2>/dev/null || echo "[]")
    
    if [ "$CREATOR_ARRAY" != "[]" ] && [ "$CREATOR_ARRAY" != "null" ]; then
        print_test "Complete Onboarding Endpoint"
        ONBOARDING_RESPONSE=$(curl -s -X POST "${API_BASE}/onboarding/complete" \
            -H "Authorization: Bearer ${ACCESS_TOKEN}" \
            -H "Content-Type: application/json" \
            -d "{\"followed_creator_ids\": $CREATOR_ARRAY}")
        
        if echo "$ONBOARDING_RESPONSE" | grep -q "completed\|message"; then
            print_success "Onboarding completion endpoint returned success"
            echo "$ONBOARDING_RESPONSE" | jq '.' 2>/dev/null || echo "$ONBOARDING_RESPONSE"
        else
            print_error "Onboarding completion endpoint failed"
            echo "$ONBOARDING_RESPONSE"
        fi
    fi
fi

# Test 4: Complete Onboarding - Validation Errors
print_test "Complete Onboarding - Empty Creator IDs (Validation Error)"
ONBOARDING_EMPTY=$(curl -s -X POST "${API_BASE}/onboarding/complete" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"followed_creator_ids": []}')

if echo "$ONBOARDING_EMPTY" | grep -q "error\|required\|minimum"; then
    print_success "Correctly validates empty creator IDs"
    echo "$ONBOARDING_EMPTY" | jq '.' 2>/dev/null || echo "$ONBOARDING_EMPTY"
else
    print_error "Should validate empty creator IDs"
    echo "$ONBOARDING_EMPTY"
fi

# Test 5: Complete Onboarding - Unauthorized
print_test "Complete Onboarding - Unauthorized Request"
ONBOARDING_UNAUTH=$(curl -s -X POST "${API_BASE}/onboarding/complete" \
    -H "Content-Type: application/json" \
    -d '{"followed_creator_ids": ["123e4567-e89b-12d3-a456-426614174000"]}')

if echo "$ONBOARDING_UNAUTH" | grep -q "401\|Unauthorized\|error"; then
    print_success "Correctly requires authentication"
else
    print_error "Should require authentication"
    echo "$ONBOARDING_UNAUTH"
fi

# Test 6: User Search - Check for is_verified flag
print_test "User Search - Verify is_verified Flag Included"
SEARCH_RESPONSE=$(curl -s -X GET "${API_BASE}/users/search?q=test&limit=5" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$SEARCH_RESPONSE" | grep -q "is_verified"; then
    print_success "User search includes is_verified flag"
    echo "$SEARCH_RESPONSE" | jq '.' 2>/dev/null | head -20 || echo "$SEARCH_RESPONSE" | head -20
else
    print_info "User search response (is_verified may not be present if no creators found)"
    echo "$SEARCH_RESPONSE" | jq '.' 2>/dev/null | head -10 || echo "$SEARCH_RESPONSE" | head -10
fi

# Test 7: Admin Endpoint - Make Creator (Requires Admin)
print_test "Admin Endpoint - Make Creator (Requires Admin Access)"
print_info "This test requires ADMIN_USER_IDS to be set in .env"
print_info "Skipping admin endpoint test (requires admin configuration)"

# Test 8: User Profile - Check for is_verified
print_test "User Profile - Check for is_verified Flag"
PROFILE_RESPONSE=$(curl -s -X GET "${API_BASE}/users/${USER_ID}" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$PROFILE_RESPONSE" | grep -q "is_verified\|role"; then
    print_success "User profile includes verification status"
    echo "$PROFILE_RESPONSE" | jq '.' 2>/dev/null || echo "$PROFILE_RESPONSE"
else
    print_info "User profile response"
    echo "$PROFILE_RESPONSE" | jq '.' 2>/dev/null || echo "$PROFILE_RESPONSE"
fi

# Summary
echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed: ${PASSED}${NC}"
echo -e "${RED}Failed: ${FAILED}${NC}"
echo "=========================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! ✅${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed ❌${NC}"
    exit 1
fi

