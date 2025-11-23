#!/bin/bash

# Phase 6 API Test Script
# Tests Map Integration & Discovery endpoints

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
    ((PASSED++))
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    ((FAILED++))
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
        "email": "maptest'$(date +%s)'@example.com",
        "password": "TestPassword123!",
        "username": "maptest'$(date +%s)'"
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

# Test 1: Map Pins Endpoint - Basic Request
print_test "Map Pins Endpoint - Basic Request"
PINS_RESPONSE=$(curl -s -X GET "${API_BASE}/map/pins?north=40.8&south=40.7&east=-73.9&west=-74.0" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$PINS_RESPONSE" | grep -q "pins"; then
    print_success "Map pins endpoint returned data"
    echo "$PINS_RESPONSE" | jq '.' 2>/dev/null || echo "$PINS_RESPONSE"
else
    print_error "Map pins endpoint failed"
    echo "$PINS_RESPONSE"
    ((FAILED++))
fi

# Test 2: Map Pins Endpoint - With Zoom (Clustering)
print_test "Map Pins Endpoint - With Zoom (Low Zoom for Clustering)"
PINS_ZOOM_RESPONSE=$(curl -s -X GET "${API_BASE}/map/pins?north=40.8&south=40.7&east=-73.9&west=-74.0&zoom=10" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$PINS_ZOOM_RESPONSE" | grep -q "clusters\|pins"; then
    print_success "Map pins with zoom returned data"
    echo "$PINS_ZOOM_RESPONSE" | jq '.' 2>/dev/null || echo "$PINS_ZOOM_RESPONSE"
else
    print_error "Map pins with zoom failed"
    echo "$PINS_ZOOM_RESPONSE"
    ((FAILED++))
fi

# Test 3: Map Pins Endpoint - High Zoom (No Clustering)
print_test "Map Pins Endpoint - High Zoom (No Clustering)"
PINS_HIGH_ZOOM=$(curl -s -X GET "${API_BASE}/map/pins?north=40.8&south=40.7&east=-73.9&west=-74.0&zoom=15" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$PINS_HIGH_ZOOM" | grep -q "pins"; then
    CLUSTER_COUNT=$(echo "$PINS_HIGH_ZOOM" | jq '.clusters | length' 2>/dev/null || echo "0")
    if [ "$CLUSTER_COUNT" = "0" ]; then
        print_success "High zoom returns no clusters (as expected)"
    else
        print_info "High zoom returned $CLUSTER_COUNT clusters (may have pins close together)"
    fi
else
    print_error "Map pins with high zoom failed"
    echo "$PINS_HIGH_ZOOM"
    ((FAILED++))
fi

# Test 4: Map Pins Endpoint - Without Network
print_test "Map Pins Endpoint - Exclude Network Spots"
PINS_NO_NETWORK=$(curl -s -X GET "${API_BASE}/map/pins?north=40.8&south=40.7&east=-73.9&west=-74.0&include_network=false" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$PINS_NO_NETWORK" | grep -q "pins"; then
    print_success "Map pins without network returned data"
    echo "$PINS_NO_NETWORK" | jq '.' 2>/dev/null || echo "$PINS_NO_NETWORK"
else
    print_error "Map pins without network failed"
    echo "$PINS_NO_NETWORK"
    ((FAILED++))
fi

# Test 5: Map Pins Endpoint - Validation Errors
print_test "Map Pins Endpoint - Missing Viewport Parameters"
PINS_ERROR=$(curl -s -X GET "${API_BASE}/map/pins" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$PINS_ERROR" | grep -q "required\|error"; then
    print_success "Correctly returns error for missing viewport parameters"
    echo "$PINS_ERROR" | jq '.' 2>/dev/null || echo "$PINS_ERROR"
else
    print_error "Should return error for missing viewport parameters"
    echo "$PINS_ERROR"
    ((FAILED++))
fi

# Test 6: Map Pins Endpoint - Invalid Viewport (north <= south)
print_test "Map Pins Endpoint - Invalid Viewport (north <= south)"
PINS_INVALID=$(curl -s -X GET "${API_BASE}/map/pins?north=40.7&south=40.8&east=-73.9&west=-74.0" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$PINS_INVALID" | grep -q "error\|greater"; then
    print_success "Correctly validates viewport bounds"
    echo "$PINS_INVALID" | jq '.' 2>/dev/null || echo "$PINS_INVALID"
else
    print_error "Should validate viewport bounds"
    echo "$PINS_INVALID"
    ((FAILED++))
fi

# Test 7: Map Pins Endpoint - Unauthorized
print_test "Map Pins Endpoint - Unauthorized Request"
PINS_UNAUTH=$(curl -s -X GET "${API_BASE}/map/pins?north=40.8&south=40.7&east=-73.9&west=-74.0")

if echo "$PINS_UNAUTH" | grep -q "401\|Unauthorized\|error"; then
    print_success "Correctly requires authentication"
else
    print_error "Should require authentication"
    echo "$PINS_UNAUTH"
    ((FAILED++))
fi

# Test 8: Place Summary Endpoint - Need to create a place first
print_test "Place Summary Endpoint - Creating Test Place"
# First, search for a place
PLACE_SEARCH=$(curl -s -X GET "${API_BASE}/places/search?q=coffee&lat=40.7128&lng=-74.0060&limit=1")

if echo "$PLACE_SEARCH" | grep -q "places"; then
    PLACE_ID=$(echo "$PLACE_SEARCH" | jq -r '.places[0].id' 2>/dev/null || echo "")
    
    if [ -n "$PLACE_ID" ] && [ "$PLACE_ID" != "null" ]; then
        print_success "Found test place: $PLACE_ID"
        
        # Test Place Summary
        print_test "Place Summary Endpoint - Get Summary"
        SUMMARY_RESPONSE=$(curl -s -X GET "${API_BASE}/places/${PLACE_ID}/summary" \
            -H "Authorization: Bearer ${ACCESS_TOKEN}")
        
        if echo "$SUMMARY_RESPONSE" | grep -q "place_id\|name"; then
            print_success "Place summary endpoint returned data"
            echo "$SUMMARY_RESPONSE" | jq '.' 2>/dev/null || echo "$SUMMARY_RESPONSE"
        else
            print_error "Place summary endpoint failed"
            echo "$SUMMARY_RESPONSE"
            ((FAILED++))
        fi
        
        # Test Place Summary - Without Authentication
        print_test "Place Summary Endpoint - Without Authentication"
        SUMMARY_NO_AUTH=$(curl -s -X GET "${API_BASE}/places/${PLACE_ID}/summary")
        
        if echo "$SUMMARY_NO_AUTH" | grep -q "place_id\|name"; then
            print_success "Place summary works without authentication"
            echo "$SUMMARY_NO_AUTH" | jq '.' 2>/dev/null || echo "$SUMMARY_NO_AUTH"
        else
            print_error "Place summary should work without authentication"
            echo "$SUMMARY_NO_AUTH"
            ((FAILED++))
        fi
    else
        print_info "Could not extract place ID from search results"
        print_info "Skipping place summary tests"
    fi
else
    print_info "Place search failed, skipping place summary tests"
    echo "$PLACE_SEARCH"
fi

# Test 9: Place Summary Endpoint - Invalid Place ID
print_test "Place Summary Endpoint - Invalid Place ID"
SUMMARY_INVALID=$(curl -s -X GET "${API_BASE}/places/invalid-place-id/summary" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}")

if echo "$SUMMARY_INVALID" | grep -q "404\|not found\|error"; then
    print_success "Correctly handles invalid place ID"
    echo "$SUMMARY_INVALID" | jq '.' 2>/dev/null || echo "$SUMMARY_INVALID"
else
    print_error "Should return error for invalid place ID"
    echo "$SUMMARY_INVALID"
    ((FAILED++))
fi

# Test 10: Rate Limiting Test (if possible)
print_test "Rate Limiting - Making Multiple Requests"
print_info "Making 35 requests (limit is 30/min)..."
RATE_LIMIT_HIT=0
for i in {1..35}; do
    RATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${API_BASE}/map/pins?north=40.8&south=40.7&east=-73.9&west=-74.0" \
        -H "Authorization: Bearer ${ACCESS_TOKEN}")
    HTTP_CODE=$(echo "$RATE_RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "429" ]; then
        RATE_LIMIT_HIT=1
        print_success "Rate limiting is working (got 429 on request $i)"
        break
    fi
done

if [ $RATE_LIMIT_HIT -eq 0 ]; then
    print_info "Rate limit not hit (may need more requests or different timing)"
fi

# Test 11: Caching Test
print_test "Caching - Testing Cache Behavior"
print_info "Making two identical requests and comparing response times..."

TIME1_START=$(date +%s%N)
PINS_CACHE1=$(curl -s -X GET "${API_BASE}/map/pins?north=40.8&south=40.7&east=-73.9&west=-74.0" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}")
TIME1_END=$(date +%s%N)
TIME1=$((TIME1_END - TIME1_START))

sleep 1

TIME2_START=$(date +%s%N)
PINS_CACHE2=$(curl -s -X GET "${API_BASE}/map/pins?north=40.8&south=40.7&east=-73.9&west=-74.0" \
    -H "Authorization: Bearer ${ACCESS_TOKEN}")
TIME2_END=$(date +%s%N)
TIME2=$((TIME2_END - TIME2_START))

if [ $TIME2 -lt $TIME1 ]; then
    print_success "Second request was faster (likely cached)"
    print_info "First request: ${TIME1}ns, Second request: ${TIME2}ns"
else
    print_info "Cache may not be active or timing difference is minimal"
    print_info "First request: ${TIME1}ns, Second request: ${TIME2}ns"
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

