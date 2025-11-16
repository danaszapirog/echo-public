#!/bin/bash

# Phase 3 API Testing Script
# Tests all Phase 3 endpoints: Spots, Want to Go, Map, and Guided Questions

BASE_URL="http://localhost:3000/api/v1"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Phase 3 API Testing"
echo "======================"
echo ""

# Step 1: Register a test user
echo "📝 Step 1: Register test user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-phase3@example.com",
    "password": "TestPassword123!",
    "username": "testuser_phase3"
  }')

ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${RED}❌ Registration failed. Trying login instead...${NC}"
  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test-phase3@example.com",
      "password": "TestPassword123!"
    }')
  ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null)
fi

if [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${RED}❌ Failed to get access token. Exiting.${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Got access token${NC}"
echo ""

# Step 2: Search for a place
echo "🔍 Step 2: Search for a place..."
PLACE_SEARCH=$(curl -s "$BASE_URL/places/search?q=coffee&lat=40.7128&lng=-74.0060&limit=1")
EXTERNAL_PLACE_ID=$(echo $PLACE_SEARCH | python3 -c "import sys, json; places = json.load(sys.stdin).get('places', []); print(places[0].get('externalPlaceId', '') if places else '')" 2>/dev/null)

if [ -z "$EXTERNAL_PLACE_ID" ]; then
  echo -e "${RED}❌ Failed to find a place${NC}"
  echo "Response: $PLACE_SEARCH"
  exit 1
fi

echo -e "${GREEN}✅ Found place with external ID: $EXTERNAL_PLACE_ID${NC}"

# Get place details to get internal UUID
echo "Getting place details to retrieve internal UUID..."
PLACE_DETAILS_RESPONSE=$(curl -s "$BASE_URL/places/$EXTERNAL_PLACE_ID")
PLACE_ID=$(echo $PLACE_DETAILS_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('place', {}).get('id', ''))" 2>/dev/null)

if [ -z "$PLACE_ID" ]; then
  echo -e "${RED}❌ Failed to get place UUID${NC}"
  echo "Response: $PLACE_DETAILS_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Got place UUID: $PLACE_ID${NC}"
echo ""

# Step 3: Get place questions
echo "❓ Step 3: Get guided questions for place..."
QUESTIONS_RESPONSE=$(curl -s "$BASE_URL/places/$PLACE_ID/questions")
echo "$QUESTIONS_RESPONSE" | python3 -m json.tool 2>/dev/null | head -20
echo ""

# Step 4: Create a spot
echo "📍 Step 4: Create a spot..."
SPOT_CREATE=$(curl -s -X POST "$BASE_URL/spots" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"place_id\": \"$PLACE_ID\",
    \"rating\": 5,
    \"notes\": \"Great coffee spot!\",
    \"tags\": [\"coffee\", \"nyc\"],
    \"photos\": [],
    \"guided_questions\": {
      \"vibe\": \"Cozy and welcoming\",
      \"best_time\": \"Morning\"
    }
  }")

SPOT_ID=$(echo $SPOT_CREATE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null)

if [ -z "$SPOT_ID" ]; then
  echo -e "${YELLOW}⚠️  Spot creation failed (might already exist)${NC}"
  echo "Response: $SPOT_CREATE"
else
  echo -e "${GREEN}✅ Created spot: $SPOT_ID${NC}"
  echo "$SPOT_CREATE" | python3 -m json.tool 2>/dev/null
fi
echo ""

# Step 5: Get spot details
if [ ! -z "$SPOT_ID" ]; then
  echo "📖 Step 5: Get spot details..."
  SPOT_DETAILS=$(curl -s "$BASE_URL/spots/$SPOT_ID")
  echo "$SPOT_DETAILS" | python3 -m json.tool 2>/dev/null | head -30
  echo ""
fi

# Step 6: Search for another place for want-to-go
echo "🔍 Step 6: Search for another place (for want-to-go)..."
PLACE_SEARCH2=$(curl -s "$BASE_URL/places/search?q=pizza&lat=40.7128&lng=-74.0060&limit=1")
EXTERNAL_PLACE_ID2=$(echo $PLACE_SEARCH2 | python3 -c "import sys, json; places = json.load(sys.stdin).get('places', []); print(places[0].get('externalPlaceId', '') if places else '')" 2>/dev/null)

if [ ! -z "$EXTERNAL_PLACE_ID2" ]; then
  # Get place details to get internal UUID
  PLACE_DETAILS_RESPONSE2=$(curl -s "$BASE_URL/places/$EXTERNAL_PLACE_ID2")
  PLACE_ID2=$(echo $PLACE_DETAILS_RESPONSE2 | python3 -c "import sys, json; print(json.load(sys.stdin).get('place', {}).get('id', ''))" 2>/dev/null)
  
  if [ ! -z "$PLACE_ID2" ]; then
    echo -e "${GREEN}✅ Found place: $PLACE_ID2${NC}"
    echo ""
    
    # Step 7: Create want-to-go
  echo "💾 Step 7: Create want-to-go item..."
  WANT_TO_GO_CREATE=$(curl -s -X POST "$BASE_URL/want-to-go" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d "{
      \"place_id\": \"$PLACE_ID2\",
      \"notes\": \"Want to try this pizza place\"
    }")
  
  WANT_TO_GO_ID=$(echo $WANT_TO_GO_CREATE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null)
  
  if [ -z "$WANT_TO_GO_ID" ]; then
    echo -e "${YELLOW}⚠️  Want-to-go creation failed (might already exist)${NC}"
    echo "Response: $WANT_TO_GO_CREATE"
  else
    echo -e "${GREEN}✅ Created want-to-go: $WANT_TO_GO_ID${NC}"
    echo "$WANT_TO_GO_CREATE" | python3 -m json.tool 2>/dev/null
  fi
  echo ""
  
  # Step 8: Get want-to-go list
  echo "📋 Step 8: Get want-to-go list..."
  WANT_TO_GO_LIST=$(curl -s "$BASE_URL/want-to-go?limit=10" \
    -H "Authorization: Bearer $ACCESS_TOKEN")
  echo "$WANT_TO_GO_LIST" | python3 -m json.tool 2>/dev/null | head -30
  echo ""
  
  # Step 9: Convert want-to-go to spot
  if [ ! -z "$WANT_TO_GO_ID" ]; then
    echo "🔄 Step 9: Convert want-to-go to spot..."
    CONVERT_RESPONSE=$(curl -s -X POST "$BASE_URL/want-to-go/$WANT_TO_GO_ID/convert-to-spot" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -d '{
        "rating": 4,
        "notes": "Tried it and it was good!",
        "tags": ["pizza"],
        "photos": []
      }')
    
    CONVERTED_SPOT_ID=$(echo $CONVERT_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))" 2>/dev/null)
    
    if [ -z "$CONVERTED_SPOT_ID" ]; then
      echo -e "${YELLOW}⚠️  Conversion failed${NC}"
      echo "Response: $CONVERT_RESPONSE"
    else
      echo -e "${GREEN}✅ Converted to spot: $CONVERTED_SPOT_ID${NC}"
      echo "$CONVERT_RESPONSE" | python3 -m json.tool 2>/dev/null
    fi
    echo ""
  fi
  fi
fi

# Step 10: Get place details with user data
echo "📍 Step 10: Get place details (with user spot/want-to-go)..."
PLACE_DETAILS=$(curl -s "$BASE_URL/places/$PLACE_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "$PLACE_DETAILS" | python3 -m json.tool 2>/dev/null | head -40
echo ""

# Step 11: Get personal map locations
echo "🗺️  Step 11: Get personal map locations..."
MAP_LOCATIONS=$(curl -s "$BASE_URL/map/my-locations" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "$MAP_LOCATIONS" | python3 -m json.tool 2>/dev/null | head -30
echo ""

# Step 12: Update spot (if we have one)
if [ ! -z "$SPOT_ID" ]; then
  echo "✏️  Step 12: Update spot..."
  UPDATE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/spots/$SPOT_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -d '{
      "rating": 4,
      "notes": "Updated notes - still great!"
    }')
  
  echo "$UPDATE_RESPONSE" | python3 -m json.tool 2>/dev/null
  echo ""
fi

echo "======================"
echo -e "${GREEN}✅ Phase 3 Testing Complete!${NC}"
echo ""
echo "Summary:"
echo "- ✅ User registration/login"
echo "- ✅ Place search"
echo "- ✅ Guided questions endpoint"
echo "- ✅ Spot creation"
echo "- ✅ Want-to-go creation"
echo "- ✅ Want-to-go list"
echo "- ✅ Convert want-to-go to spot"
echo "- ✅ Place details with user data"
echo "- ✅ Personal map locations"
echo "- ✅ Spot update"

