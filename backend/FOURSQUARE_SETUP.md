# Foursquare API Setup Guide

## Current Status
❌ API key is being read but Foursquare API returns "Invalid request token"

## Steps to Fix

### 1. Verify Your Foursquare API Key

1. Go to https://developer.foursquare.com/
2. Log in to your account
3. Navigate to "My Apps" → Select your app
4. Check the "API Key" section

### 2. Generate a New API Key (if needed)

If your current key isn't working:

1. In your Foursquare app dashboard
2. Look for "API Key" or "Generate API Key" option
3. Copy the new API key (it should be a long alphanumeric string)

**Important:** For Foursquare Places API v3, you need an **API Key** (not OAuth credentials).

### 3. Update .env File

Open `backend/.env` and update:
```bash
FOURSQUARE_API_KEY=your-new-api-key-here
```

### 4. Test the API Key Directly

Test with curl to verify it works:
```bash
curl "https://api.foursquare.com/v3/places/search?query=coffee&ll=40.7128,-74.0060&limit=2" \
  -H "Authorization: YOUR_API_KEY_HERE" \
  -H "Accept-Language: en"
```

If successful, you should see JSON with place results.

### 5. Restart Server

After updating `.env`:
```bash
cd backend
# Stop server (Ctrl+C or pkill)
npm run dev
```

### 6. Test Endpoint

```bash
curl "http://localhost:3000/api/v1/places/search?q=coffee&lat=40.7128&lng=-74.0060&limit=2"
```

---

## Troubleshooting

### "Invalid request token"
- API key is incorrect or expired
- Regenerate API key in Foursquare dashboard
- Ensure no extra spaces in `.env` file

### "API key not configured"
- Check `FOURSQUARE_API_KEY` is set in `.env`
- Restart server after updating `.env`
- Verify `.env` file is in `backend/` directory

### Rate Limiting
- Foursquare has rate limits on free tier
- Check your usage in Foursquare dashboard
- Consider upgrading plan if needed

---

## Current Configuration

Your current API key (first 10 chars): `VUWZRHF0H1...`

**Action Required:** Verify this key is valid in Foursquare dashboard or generate a new one.

