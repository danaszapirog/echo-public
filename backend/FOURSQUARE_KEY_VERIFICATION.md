# Foursquare API Key Verification Results

## Current Status
❌ **API Key Invalid** - Returns "Invalid request token" (401)

## Analysis

### Current API Key Status
- **Length:** 48 characters (example shown was invalid format)
- **Prefix:** Did NOT start with `fsq_`
- **Status:** ❌ Invalid format (key has been removed from this file for security)

### Expected Format for Places API v3
- **Prefix:** Should start with `fsq_`
- **Length:** Typically 60+ characters
- **Format:** `fsq_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

## Test Results

### Test 1: Direct API Key (Old Format - Example)
```bash
curl -H "Authorization: YOUR_API_KEY_HERE" \
  "https://api.foursquare.com/v3/places/search?query=coffee&ll=40.7128,-74.0060"
```
**Result:** ❌ `{"message":"Invalid request token."}` (401) - Old API format

### Test 2: Bearer Token Format (New Format)
```bash
curl -H "Authorization: Bearer YOUR_SERVICE_KEY_HERE" \
  "https://places-api.foursquare.com/places/search?query=coffee&ll=40.7128,-74.0060"
```
**Result:** ⚠️ `{"message":"This endpoint is no longer supported..."}`

## Action Required

### Step 1: Get Correct API Key

1. **Go to Foursquare Developer Dashboard:**
   - Visit: https://developer.foursquare.com/
   - Log in to your account

2. **Navigate to Your App:**
   - Go to "My Apps" or "Apps"
   - Select your app (or create a new one)

3. **Generate Places API Key:**
   - Look for "Places API" section
   - Click "Generate API Key" or "Get API Key"
   - The key should start with `fsq_`
   - Copy the full key

4. **Alternative: Check API Keys Section:**
   - In your app dashboard, look for "API Keys" or "Keys"
   - Find the "Places API Key" (not OAuth credentials)
   - It should be labeled as "Places API v3" key

### Step 2: Update .env File

Replace the current key in `backend/.env`:
```bash
FOURSQUARE_API_KEY=fsq_your_actual_key_here
```

### Step 3: Verify the New Key

Test directly:
```bash
curl "https://api.foursquare.com/v3/places/search?query=coffee&ll=40.7128,-74.0060&limit=2" \
  -H "Authorization: fsq_your_actual_key_here" \
  -H "Accept-Language: en"
```

Expected successful response:
```json
{
  "results": [
    {
      "fsq_id": "...",
      "name": "...",
      ...
    }
  ]
}
```

### Step 4: Restart Server

After updating `.env`:
```bash
cd backend
# Stop server
pkill -f "node dist/server.js"
# Start server
npm run dev
```

### Step 5: Test Endpoint

```bash
curl "http://localhost:3000/api/v1/places/search?q=coffee&lat=40.7128&lng=-74.0060&limit=2"
```

---

## Common Issues

### Issue: "Can't find Places API Key"
**Solution:** 
- Make sure you're looking at the correct app
- Places API v3 keys are separate from OAuth credentials
- You may need to enable Places API for your app first

### Issue: "Key still doesn't work"
**Solution:**
- Verify key has no extra spaces
- Check key is copied completely (60+ characters)
- Ensure key starts with `fsq_`
- Try regenerating the key

### Issue: "Rate limit exceeded"
**Solution:**
- Check your usage in Foursquare dashboard
- Free tier has limits
- Wait or upgrade plan

---

## Next Steps

1. ✅ Get new API key from Foursquare dashboard (format: `fsq_...`)
2. ✅ Update `backend/.env` with new key
3. ✅ Test key directly with curl
4. ✅ Restart server
5. ✅ Test `/api/v1/places/search` endpoint

---

**Current Key Status:** ❌ Invalid - Needs replacement with `fsq_` format key

