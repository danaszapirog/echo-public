# Geospatial Query Decision

## Decision: Simple Lat/Lng Filtering

**Date:** After Phase 5 completion  
**Phase:** Phase 6 - Map Integration & Discovery

## Decision

We will use **Simple Lat/Lng Filtering** instead of PostGIS extension for Phase 6 map features.

## Rationale

1. **MVP Focus:** Simple lat/lng filtering is sufficient for MVP requirements
2. **Simplicity:** No additional database extension setup required
3. **Performance:** Adequate for viewport-based queries with expected data volumes
4. **Flexibility:** Can upgrade to PostGIS later if needed without breaking changes

## Implementation Approach

### Query Pattern
- Use PostgreSQL's native comparison operators (`>=`, `<=`) for bounding box queries
- Filter places/spots within viewport using:
  ```sql
  WHERE latitude >= :south 
    AND latitude <= :north 
    AND longitude >= :west 
    AND longitude <= :east
  ```

### Indexing Strategy
- Create B-tree indexes on `latitude` and `longitude` columns
- Consider composite indexes for common query patterns
- Index on `places.latitude`, `places.longitude`
- Index on `spots.place_id` for joins

### Limitations
- Less accurate for edge cases (poles, date line)
- May have performance issues with very large datasets (>100k places)
- Limited to bounding box queries (no distance calculations)

### Future Upgrade Path
If we need PostGIS later:
1. Install PostGIS extension: `CREATE EXTENSION postgis;`
2. Add geometry columns: `ALTER TABLE places ADD COLUMN location geometry(Point, 4326);`
3. Migrate data: `UPDATE places SET location = ST_MakePoint(longitude, latitude);`
4. Create GIST index: `CREATE INDEX places_location_idx ON places USING GIST(location);`
5. Update queries to use PostGIS functions

## Files Affected

- `backend/src/services/mapService.ts` - Map query logic
- Database migrations - Index creation
- `backend/src/controllers/mapController.ts` - Map endpoints

## References

- Technical Design Document: Phase 6, Task 6.1
- Pre-Implementation Checklist: Line 301

