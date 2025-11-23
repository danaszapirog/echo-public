# Phase 6: Database Indexing Strategy

## Overview

This document outlines the database indexing strategy for Phase 6 map features using **Simple Lat/Lng Filtering** (not PostGIS).

## Current Indexes

### Places Table
- ✅ `external_place_id` (unique index)
- ✅ `categories` (GIN index for JSONB)

### Spots Table
- ✅ `user_id` (B-tree index)
- ✅ `place_id` (B-tree index)
- ✅ `created_at` (B-tree index, DESC)
- ✅ `tags` (GIN index for array)
- ✅ `user_id + place_id` (unique composite index)

### Want to Go Table
- ✅ `user_id` (B-tree index)
- ✅ `place_id` (B-tree index)
- ✅ `user_id + place_id` (unique composite index)

## Required Indexes for Phase 6

### 1. Places Table - Geospatial Indexes

**Priority: HIGH** - Critical for viewport queries

```sql
-- Index for latitude (for bounding box queries)
CREATE INDEX idx_places_latitude ON places(latitude);

-- Index for longitude (for bounding box queries)
CREATE INDEX idx_places_longitude ON places(longitude);

-- Composite index for viewport queries (most common query pattern)
CREATE INDEX idx_places_location ON places(latitude, longitude);
```

**Query Pattern:**
```sql
WHERE latitude >= :south 
  AND latitude <= :north 
  AND longitude >= :west 
  AND longitude <= :east
```

**Rationale:**
- Single-column indexes on `latitude` and `longitude` help with range queries
- Composite index `(latitude, longitude)` optimizes the most common query pattern
- PostgreSQL can use index scans efficiently for these range queries

### 2. Spots Table - Additional Indexes

**Priority: MEDIUM** - For joins and filtering

```sql
-- Composite index for user + place lookups (already exists as unique)
-- No additional indexes needed for map queries
```

**Note:** Existing indexes are sufficient for map queries since we join through `place_id`.

### 3. Want to Go Table - Additional Indexes

**Priority: MEDIUM** - For joins and filtering

```sql
-- Composite index for user + place lookups (already exists as unique)
-- No additional indexes needed for map queries
```

**Note:** Existing indexes are sufficient for map queries.

## Index Creation Migration

### Migration File: `prisma/migrations/XXXXXX_add_map_indexes/migration.sql`

```sql
-- Add geospatial indexes for places table
CREATE INDEX IF NOT EXISTS idx_places_latitude ON places(latitude);
CREATE INDEX IF NOT EXISTS idx_places_longitude ON places(longitude);
CREATE INDEX IF NOT EXISTS idx_places_location ON places(latitude, longitude);
```

### Prisma Schema Update

Add to `Place` model in `schema.prisma`:

```prisma
model Place {
  // ... existing fields ...
  
  @@index([latitude])
  @@index([longitude])
  @@index([latitude, longitude])
  @@map("places")
}
```

## Query Performance Considerations

### Expected Query Patterns

1. **Viewport Query (Most Common)**
   ```sql
   SELECT p.* FROM places p
   WHERE p.latitude >= :south 
     AND p.latitude <= :north 
     AND p.longitude >= :west 
     AND p.longitude <= :east
   ```
   - Uses: `idx_places_location` composite index
   - Performance: Excellent with index

2. **Join with Spots**
   ```sql
   SELECT p.*, s.* FROM places p
   JOIN spots s ON s.place_id = p.id
   WHERE p.latitude >= :south AND ...
   ```
   - Uses: `idx_places_location` + `idx_spots_place_id`
   - Performance: Good with both indexes

3. **Filter by User's Spots**
   ```sql
   SELECT p.* FROM places p
   JOIN spots s ON s.place_id = p.id
   WHERE s.user_id = :userId
     AND p.latitude >= :south AND ...
   ```
   - Uses: `idx_spots_user_id` + `idx_places_location`
   - Performance: Good with both indexes

## Index Maintenance

### Monitoring

- Monitor index size growth
- Check index usage with `pg_stat_user_indexes`
- Review query plans with `EXPLAIN ANALYZE`

### Optimization

- Consider partial indexes if filtering by specific conditions frequently
- Monitor for index bloat and rebuild if needed
- Consider index-only scans for frequently accessed columns

## Performance Benchmarks

### Target Performance

- Viewport query: < 100ms for 1000 places
- Map pins query with joins: < 200ms
- Clustered pins query: < 300ms

### Testing

After creating indexes, test with:
```sql
EXPLAIN ANALYZE
SELECT p.* FROM places p
WHERE p.latitude >= 40.7 AND p.latitude <= 40.8
  AND p.longitude >= -74.0 AND p.longitude <= -73.9;
```

## Future Considerations

If upgrading to PostGIS later:
- Replace `idx_places_location` with GIST index
- Add geometry column: `location geometry(Point, 4326)`
- Use spatial functions: `ST_Within`, `ST_Distance`, etc.

## Implementation Checklist

- [ ] Create migration file for new indexes
- [ ] Update Prisma schema with index definitions
- [ ] Run migration: `npx prisma migrate dev --name add_map_indexes`
- [ ] Verify indexes created: `\d+ places` in psql
- [ ] Test query performance with `EXPLAIN ANALYZE`
- [ ] Monitor index usage in production

---

**Last Updated:** Phase 6 Planning

