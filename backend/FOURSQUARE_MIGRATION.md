# Foursquare API Migration - Updated Implementation

## Changes Made

Based on the [Foursquare Migration Guide](https://docs.foursquare.com/fsq-developers-places/reference/migration-guide), the following updates have been made:

### 1. API Host Changed
- **Old:** `api.foursquare.com/v3`
- **New:** `places-api.foursquare.com` (no version segment)

### 2. Authentication Changed
- **Old:** `Authorization: <API_KEY>`
- **New:** `Authorization: Bearer <SERVICE_KEY>`

### 3. Versioning Changed
- **Old:** Version in URL path (`/v3/`)
- **New:** Version in header (`X-Places-Api-Version: 2025-06-17`)

### 4. Field Name Changes
- **Old:** `fsq_id`
- **New:** `fsq_place_id`

- **Old:** `geocodes.main.latitude/longitude`
- **New:** `latitude` and `longitude` (direct fields)

- **Old:** `categories[].id` (number)
- **New:** `categories[].id` (string/BSON ID)

### 5. Endpoint Paths Updated
- **Search:** `/places/search` (was `/v3/places/search`)
- **Details:** `/places/{fsq_place_id}` (was `/v3/places/{fsq_id}`)

## Updated Code

### FoursquareService (`src/services/foursquareService.ts`)
- ✅ Updated base URL to `places-api.foursquare.com`
- ✅ Changed authentication to `Bearer <SERVICE_KEY>`
- ✅ Added `X-Places-Api-Version` header
- ✅ Updated interface to use `fsq_place_id`
- ✅ Updated to use direct `latitude`/`longitude` fields
- ✅ Updated category ID type to string

### PlaceDataService (`src/services/placeDataService.ts`)
- ✅ Updated normalization to use `fsq_place_id`
- ✅ Updated to use direct latitude/longitude fields

## Getting a Service Key

1. Go to https://developer.foursquare.com/
2. Navigate to your app
3. Look for "Service API Keys" or "Places API Keys"
4. Generate a new service key (starts with `fsq_` or similar)
5. Update `.env`:
   ```bash
   FOURSQUARE_API_KEY=your_service_key_here
   ```

## Testing

Test the updated endpoint:
```bash
curl "https://places-api.foursquare.com/places/search?query=coffee&ll=40.7128,-74.0060&limit=2" \
  -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  -H "X-Places-Api-Version: 2025-06-17" \
  -H "Accept-Language: en"
```

Then test our endpoint:
```bash
curl "http://localhost:3000/api/v1/places/search?q=coffee&lat=40.7128&lng=-74.0060&limit=2"
```

## References

- [Migration Guide](https://docs.foursquare.com/fsq-developers-places/reference/migration-guide)
- [Manage Service API Keys](https://docs.foursquare.com/developer/docs/manage-service-api-keys)
- [Places API Get Started](https://docs.foursquare.com/developer/reference/places-api-get-started)

