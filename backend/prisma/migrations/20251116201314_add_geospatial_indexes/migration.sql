-- Add geospatial indexes for efficient viewport queries
-- Composite index on (latitude, longitude) for Place table
CREATE INDEX IF NOT EXISTS "places_latitude_longitude_idx" ON "places"("latitude", "longitude");