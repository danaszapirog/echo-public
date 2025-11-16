# Technical Design Document

## Project Echo: Social Recommendation App v1.0 (MVP)

**Version:** 1.0  
**Date:** 2024  
**Status:** Draft  
**Authors:** Engineering Team

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Technical Requirements Derived from Business Requirements](#2-technical-requirements-derived-from-business-requirements)
3. [Technology Stack Recommendations](#3-technology-stack-recommendations)
4. [Data Models and Database Design](#4-data-models-and-database-design)
5. [API Specifications](#5-api-specifications)
6. [Security Considerations](#6-security-considerations)
7. [Scalability and Performance Requirements](#7-scalability-and-performance-requirements)
8. [Integration Points](#8-integration-points)
9. [Development Phases and Milestones](#9-development-phases-and-milestones)
10. [Risk Assessment and Mitigation Strategies](#10-risk-assessment-and-mitigation-strategies)

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

Project Echo follows a **client-server architecture** with native mobile applications (iOS and Android) communicating with a cloud-based backend API. The system is designed to be scalable, secure, and performant from day one.

```
┌─────────────────┐         ┌─────────────────┐
│   iOS Native    │         │ Android Native  │
│     App         │         │      App        │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │      HTTPS/REST API       │
         │                           │
         └───────────┬───────────────┘
                     │
         ┌───────────▼───────────┐
         │   API Gateway /       │
         │   Load Balancer       │
         └───────────┬───────────┘
                     │
         ┌───────────▼───────────┐
         │   Backend Services    │
         │  (Node.js/Python)     │
         └───────────┬───────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
┌───▼────┐    ┌──────▼──────┐  ┌─────▼─────┐
│  RDBMS │    │   Redis     │  │   S3/CDN  │
│(Postgres)│   │  (Cache)    │  │  (Media)  │
└─────────┘    └────────────┘  └───────────┘
                     │
         ┌───────────▼───────────┐
         │  External Services    │
         │  - Map Provider       │
         │  - Place Data API     │
         │  - OAuth Providers (v1.1) │
         └───────────────────────┘
```

### 1.2 Component Architecture

**Mobile Applications (Client Layer)**
- Native iOS app (Swift/SwiftUI)
- Native Android app (Kotlin/Jetpack Compose)
- Shared business logic where possible
- Offline-first architecture with local caching

**Backend Services (Application Layer)**
- RESTful API server
- Authentication & Authorization service
- Content management service
- Social graph service
- Map data aggregation service

**Data Layer**
- Primary database: PostgreSQL (relational data)
- Cache layer: Redis (session management, frequently accessed data)
- Object storage: AWS S3 or equivalent (user-uploaded media)

**External Integrations**
- Map visualization service (Mapbox recommended per BRD Section 6)
- Place data service (Foursquare Places API recommended)
- OAuth providers (Google, Apple) - v1.1 only

### 1.3 Data Flow

**Core User Flow: Discovering and Saving a Location** (Referencing PRD Section 4, User Flow)

1. User opens map → Mobile app requests map tiles from Map Provider
2. App requests Spots from followed users in current viewport → Backend queries database
3. Backend enriches with place data from Place Data API (cached where possible)
4. User taps pin → App displays summary card (cached data)
5. User saves location → App sends request to Backend API
6. Backend validates, stores in database, updates cache
7. App updates local state and map display

---

## 2. Technical Requirements Derived from Business Requirements

### 2.1 Functional Requirements Mapping

| BRD/PRD Requirement | Technical Implementation |
|-------------------|------------------------|
| **User Account Management** (BRD Section 4.1) | JWT-based authentication, email/password authentication only (OAuth for Google/Apple moved to v1.1), secure password hashing (bcrypt with salt) |
| **Two User Roles** (BRD Section 3) | Role-based access control (RBAC) in database schema, creator verification flag, public profile enforcement for creators |
| **Map-Centric Interface** (BRD Section 3, PRD Feature 2) | Custom map styling via Mapbox, efficient pin clustering algorithm, viewport-based data fetching |
| **Content Creation (Playlists & Spots)** (BRD Section 4.3, PRD Feature 3) | Rich text editor for notes, image upload pipeline, guided question templates stored in database |
| **Saving Locations** (BRD Section 4.4) | Two distinct entity types: `spots` and `want_to_go`, conversion workflow, privacy controls |
| **Social Following & Feed** (BRD Section 4.5, PRD Feature 4) | Graph database considerations for follower relationships, chronological feed generation, follow request workflow |

### 2.2 Non-Functional Requirements Mapping

| BRD/PRD Requirement | Technical Target |
|-------------------|-----------------|
| **Performance: Map scrolling** (BRD Section 6) | Implement pin clustering, lazy loading, viewport-based API calls, client-side caching |
| **Performance: Load time < 3s** (BRD Section 6) | API response time < 400ms (PRD Section 5), CDN for static assets, image optimization |
| **Performance: Cold start < 4s** (BRD Section 6, PRD Section 5) | Optimize app bundle size, lazy load non-critical modules, pre-fetch essential data |
| **Security: Password hashing** (BRD Section 6) | bcrypt with cost factor 12, salt per password |
| **Security: HTTPS** (BRD Section 6) | TLS 1.3, certificate pinning on mobile clients |
| **Security: Location privacy** (BRD Section 6) | Location only sent when app is active, explicit user permission, no background tracking |
| **Usability: Platform guidelines** (BRD Section 6) | Native UI components, platform-specific design systems |
| **Scalability: 10,000 concurrent users** (PRD Section 5) | Horizontal scaling architecture, database connection pooling, read replicas |

### 2.3 Data Requirements

**External Place Data** (Referencing BRD Section 6, Data & External Services)
- Essential fields only: Unique ID, Name, Latitude/Longitude, Categories
- Caching strategy: Cache place data for 30 days (places rarely change)
- Rate limiting: Implement request throttling to manage API costs

**User-Generated Content**
- All reviews, playlists, spots stored in our database
- Linked to external place via permanent place identifier
- Full-text search capability for user content

---

## 3. Technology Stack Recommendations

### 3.1 Mobile Applications

**iOS**
- **Language:** Swift 5.9+
- **UI Framework:** SwiftUI (modern, declarative)
- **Architecture:** MVVM (Model-View-ViewModel)
- **Networking:** URLSession with async/await, or Alamofire
- **Local Storage:** Core Data or SQLite for offline support
- **Image Loading:** SDWebImageSwiftUI or Kingfisher
- **Maps:** Mapbox SDK for iOS

**Android**
- **Language:** Kotlin
- **UI Framework:** Jetpack Compose
- **Architecture:** MVVM with Android Architecture Components
- **Networking:** Retrofit + OkHttp with Kotlin Coroutines
- **Local Storage:** Room Database
- **Image Loading:** Coil
- **Maps:** Mapbox SDK for Android

**Rationale:** Native development ensures best performance, adherence to platform guidelines (BRD Section 6), and access to platform-specific features (OAuth sign-in will be added in v1.1).

### 3.2 Backend Services

**Primary Recommendation: Node.js with TypeScript**
- **Runtime:** Node.js 20 LTS
- **Framework:** Express.js or Fastify
- **Language:** TypeScript (type safety, better maintainability)
- **ORM/Database:** Prisma or TypeORM with PostgreSQL
- **Authentication:** Passport.js, JWT (jsonwebtoken)
- **Validation:** Zod or Joi
- **Caching:** ioredis (Redis client)

**Alternative: Python**
- **Framework:** FastAPI (high performance, async support)
- **ORM:** SQLAlchemy
- **Authentication:** python-jose for JWT, passlib for password hashing

**Rationale:** Node.js aligns well with JavaScript ecosystem, fast development, good async performance. Python alternative offers strong data processing capabilities if needed.

### 3.3 Database

**Primary Database: PostgreSQL 15+**
- **Rationale:** 
  - ACID compliance for user data integrity
  - Excellent support for JSON columns (for flexible data like tags, guided questions)
  - Full-text search capabilities (PostgreSQL's `tsvector`)
  - Strong performance with proper indexing
  - Mature ecosystem and tooling

**Caching Layer: Redis 7+**
- **Use Cases:**
  - Session storage (JWT refresh tokens)
  - Frequently accessed data (user profiles, place summaries)
  - Rate limiting counters
  - Feed caching (last 24 hours of feed data)

### 3.4 Object Storage & CDN

**Recommendation: AWS S3 + CloudFront**
- **S3:** User-uploaded images (profile pictures, spot photos, playlist covers)
- **CloudFront:** CDN for fast global image delivery
- **Image Processing:** AWS Lambda with Sharp (or ImageMagick) for thumbnails/resizing

**Alternative: Cloudflare R2** (S3-compatible, no egress fees)

### 3.5 Infrastructure & DevOps

**Cloud Provider: AWS (Recommended)**
- **Compute:** AWS ECS (Fargate) or EC2 with Auto Scaling
- **Database:** AWS RDS (PostgreSQL) with Multi-AZ for high availability
- **Cache:** AWS ElastiCache (Redis)
- **Load Balancer:** AWS Application Load Balancer
- **Monitoring:** AWS CloudWatch, DataDog, or New Relic

**Alternative: Google Cloud Platform**
- Compute Engine or Cloud Run
- Cloud SQL (PostgreSQL)
- Cloud Memorystore (Redis)

**CI/CD:**
- GitHub Actions or GitLab CI
- Automated testing, linting, security scanning
- Staging and production environments

**Containerization:**
- Docker for backend services
- Docker Compose for local development

### 3.6 External Services

**Map Visualization: Mapbox**
- **Rationale:** 
  - Extensive brand customization (BRD Section 6 requirement)
  - High performance, smooth rendering
  - Good mobile SDK support
  - Competitive pricing for startup volumes

**Place Data: Foursquare Places API**
- **Rationale:**
  - Comprehensive POI database
  - Rich contextual data and categories
  - Stable, permanent place IDs
  - Good API documentation

**Alternative Place Data:** Google Places API (more expensive, but very comprehensive)

---

## 4. Data Models and Database Design

### 4.1 Core Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    User    │─────────│   Follow     │─────────│    User     │
│            │         │  (self-ref)  │         │             │
└──────┬─────┘         └──────────────┘         └──────┬──────┘
       │                                                │
       │                                                │
       │ 1:N                                           │
       │                                                │
┌──────▼──────┐                              ┌────────▼──────┐
│   Profile   │                              │   Follow     │
│             │                              │   Request    │
└─────────────┘                              └──────────────┘

┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Playlist  │─────────│ Playlist_Spot│─────────│    Spot     │
│             │         │  (junction)  │         │             │
└─────────────┘         └──────────────┘         └──────┬──────┘
                                                        │
                                                        │
                                                ┌───────▼────────┐
                                                │     Place      │
                                                │  (external ID) │
                                                └────────────────┘

┌─────────────┐
│  Want_To_Go │
│             │
└──────┬──────┘
       │
       │
┌──────▼────────┐
│     Place     │
│  (external ID)│
└───────────────┘
```

### 4.2 Database Schema

#### 4.2.1 Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Required for MVP (email/password auth only)
    username VARCHAR(50) UNIQUE NOT NULL,
    bio TEXT,
    profile_picture_url TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'consumer', -- 'consumer' or 'creator'
    is_verified BOOLEAN DEFAULT FALSE, -- For creators
    is_private BOOLEAN DEFAULT FALSE, -- Only for consumers
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT check_role CHECK (role IN ('consumer', 'creator')),
    CONSTRAINT check_creator_public CHECK (
        (role = 'creator' AND is_private = FALSE) OR 
        (role = 'consumer')
    )
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role) WHERE role = 'creator';
```

**Reference:** BRD Section 3 (Two User Roles), PRD Feature 1

#### 4.2.2 OAuth Accounts Table (v1.1 - Future)

**Note:** This table is reserved for v1.1 when Google/Apple Sign-In is implemented. It is not needed for MVP.

```sql
CREATE TABLE oauth_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL, -- 'google' or 'apple'
    provider_user_id VARCHAR(255) NOT NULL,
    access_token_encrypted TEXT, -- Encrypted storage
    refresh_token_encrypted TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(provider, provider_user_id)
);

CREATE INDEX idx_oauth_user_id ON oauth_accounts(user_id);
```

**Reference:** BRD Section 4.1 (Social Sign-In - v1.1)

#### 4.2.3 Places Table (External Place Reference)

```sql
CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_place_id VARCHAR(255) UNIQUE NOT NULL, -- From Foursquare/Mapbox
    external_provider VARCHAR(50) NOT NULL DEFAULT 'foursquare',
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    categories JSONB, -- Array of category strings
    cached_data JSONB, -- Store essential fields from external API
    cached_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT check_coordinates CHECK (
        latitude >= -90 AND latitude <= 90 AND
        longitude >= -180 AND longitude <= 180
    )
);

CREATE INDEX idx_places_external_id ON places(external_place_id);
CREATE INDEX idx_places_location ON places USING GIST (
    ll_to_earth(latitude, longitude)
); -- PostGIS extension for geospatial queries
CREATE INDEX idx_places_categories ON places USING GIN(categories);
```

**Reference:** BRD Section 6 (Data & External Services - Essential Data Fields)

#### 4.2.4 Spots Table

```sql
CREATE TABLE spots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE RESTRICT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    tags TEXT[], -- Array of tag strings
    photos JSONB, -- Array of S3 URLs
    guided_questions JSONB, -- Store Q&A pairs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, place_id) -- One spot per user per place
);

CREATE INDEX idx_spots_user_id ON spots(user_id);
CREATE INDEX idx_spots_place_id ON spots(place_id);
CREATE INDEX idx_spots_created_at ON spots(created_at DESC);
CREATE INDEX idx_spots_tags ON spots USING GIN(tags);
CREATE FULLTEXT INDEX idx_spots_notes ON spots USING GIN(to_tsvector('english', notes));
```

**Reference:** BRD Section 4.3 (Content Creation), PRD Feature 3.2

#### 4.2.5 Want to Go Table

```sql
CREATE TABLE want_to_go (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE RESTRICT,
    notes TEXT, -- Optional note from user when saving
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, place_id)
);

CREATE INDEX idx_want_to_go_user_id ON want_to_go(user_id);
CREATE INDEX idx_want_to_go_place_id ON want_to_go(place_id);
CREATE FULLTEXT INDEX idx_want_to_go_notes ON want_to_go USING GIN(to_tsvector('english', notes)) WHERE notes IS NOT NULL;
```

**Reference:** BRD Section 4.4 (Saving Locations), PRD Feature 3.1

#### 4.2.6 Playlists Table

```sql
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT check_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 255)
);

CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlists_published ON playlists(is_published, published_at DESC) WHERE is_published = TRUE;
```

**Reference:** BRD Section 4.3 (Content Creation), PRD Feature 3.3

#### 4.2.7 Playlist Spots Junction Table

```sql
CREATE TABLE playlist_spots (
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    spot_id UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
    display_order INTEGER NOT NULL DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (playlist_id, spot_id)
);

CREATE INDEX idx_playlist_spots_playlist ON playlist_spots(playlist_id, display_order);
CREATE INDEX idx_playlist_spots_spot ON playlist_spots(spot_id);
```

**Reference:** BRD Section 4.3 (Playlists comprised of Spots)

#### 4.2.8 Follows Table

```sql
CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'pending', 'blocked'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT check_no_self_follow CHECK (follower_id != followee_id),
    CONSTRAINT check_follow_status CHECK (status IN ('active', 'pending', 'blocked')),
    UNIQUE(follower_id, followee_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id, status);
CREATE INDEX idx_follows_followee ON follows(followee_id, status);
```

**Reference:** BRD Section 4.5 (Social & Following), PRD Feature 4.1

#### 4.2.9 Feed Items Table (Denormalized for Performance)

```sql
CREATE TABLE feed_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- The user who should see this
    content_type VARCHAR(20) NOT NULL, -- 'playlist' or 'spot'
    content_id UUID NOT NULL, -- References playlists.id or spots.id
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT check_content_type CHECK (content_type IN ('playlist', 'spot'))
);

CREATE INDEX idx_feed_items_user_created ON feed_items(user_id, created_at DESC);
CREATE INDEX idx_feed_items_author ON feed_items(author_id);
```

**Reference:** PRD Feature 4.2 (Chronological Feed)

### 4.3 Data Relationships Summary

- **User → Profile:** 1:1 (profile data embedded in users table for MVP)
- **User → Spots:** 1:N
- **User → Want to Go:** 1:N
- **User → Playlists:** 1:N
- **User → Follows:** N:M (self-referential)
- **Place → Spots:** 1:N
- **Place → Want to Go:** 1:N
- **Playlist → Spots:** N:M (via playlist_spots junction)
- **Spot → Playlists:** N:M (via playlist_spots junction)

---

## 5. API Specifications

### 5.1 API Design Principles

- **RESTful conventions:** Use standard HTTP methods (GET, POST, PUT, DELETE, PATCH)
- **Versioning:** `/api/v1/` prefix for all endpoints
- **Authentication:** Bearer token (JWT) in `Authorization` header
- **Response format:** JSON
- **Error handling:** Consistent error response structure
- **Pagination:** Cursor-based or offset-based for list endpoints
- **Rate limiting:** Per-user and per-IP limits

### 5.2 Authentication Endpoints

#### POST /api/v1/auth/register
**Description:** User registration (BRD Section 4.1, PRD Feature 1.1)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "alex_explorer"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "alex_explorer",
    "role": "consumer"
  },
  "access_token": "jwt_token",
  "refresh_token": "refresh_token"
}
```

#### POST /api/v1/auth/login
**Description:** User login

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "user": { ... },
  "access_token": "jwt_token",
  "refresh_token": "refresh_token"
}
```

**Note:** OAuth endpoints (Google/Apple Sign-In) are moved to v1.1. MVP supports email/password authentication only.

#### POST /api/v1/auth/refresh
**Description:** Refresh access token

**Request Body:**
```json
{
  "refresh_token": "refresh_token"
}
```

### 5.3 User & Profile Endpoints

#### GET /api/v1/users/me
**Description:** Get current user profile

**Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "alex_explorer",
  "bio": "Food lover",
  "profile_picture_url": "https://...",
  "role": "consumer",
  "is_private": false
}
```

#### PATCH /api/v1/users/me
**Description:** Update current user profile (PRD Feature 1.2)

**Request Body:**
```json
{
  "username": "new_username",
  "bio": "Updated bio",
  "profile_picture_url": "https://...",
  "is_private": true
}
```

#### GET /api/v1/users/:userId
**Description:** Get public user profile (PRD Feature 2.3)

**Response (200 OK):**
```json
{
  "id": "uuid",
  "username": "chloe_tastemaker",
  "bio": "Food blogger",
  "profile_picture_url": "https://...",
  "role": "creator",
  "is_following": false,
  "follow_status": null
}
```

#### GET /api/v1/users/search
**Description:** Search users by username (BRD Section 4.5, PRD Feature 4.1)

**Query Parameters:**
- `q` (required): Search query
- `limit`: Results per page (default: 20)
- `offset`: Pagination offset

**Response (200 OK):**
```json
{
  "users": [
    {
      "id": "uuid",
      "username": "alex_explorer",
      "profile_picture_url": "https://...",
      "role": "consumer"
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

### 5.4 Places & Discovery Endpoints

#### GET /api/v1/places/search
**Description:** Search for places (BRD Section 4.2, PRD Feature 2.1)

**Query Parameters:**
- `q` (required): Search query (name or address)
- `lat`: Latitude (for proximity search)
- `lng`: Longitude
- `limit`: Results per page (default: 20)

**Response (200 OK):**
```json
{
  "places": [
    {
      "id": "uuid",
      "external_place_id": "foursquare_123",
      "name": "Joe's Pizza",
      "latitude": 40.7282,
      "longitude": -73.9942,
      "categories": ["Pizza Place", "Restaurant"]
    }
  ]
}
```

#### GET /api/v1/places/:placeId
**Description:** Get place details with spots from network (PRD Feature 2.2, 2.3)

**Response (200 OK):**
```json
{
  "place": {
    "id": "uuid",
    "name": "Joe's Pizza",
    "latitude": 40.7282,
    "longitude": -73.9942,
    "categories": ["Pizza Place"]
  },
  "user_spot": {
    "id": "uuid",
    "rating": 5,
    "notes": "Best slice in NYC",
    "tags": ["pizza", "classic"],
    "created_at": "2024-01-15T10:00:00Z"
  },
  "user_want_to_go": {
    "id": "uuid",
    "notes": "Heard great things about this place",
    "created_at": "2024-01-10T10:00:00Z"
  },
  "network_spots": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "username": "chloe_tastemaker",
        "profile_picture_url": "https://..."
      },
      "rating": 5,
      "notes": "Must try!",
      "tags": ["pizza"],
      "photos": ["https://..."],
      "created_at": "2024-01-10T10:00:00Z"
    }
  ],
  "network_stats": {
    "total_spots": 15,
    "average_rating": 4.7
  }
}
```

**Note:** `user_want_to_go` will be `null` if the user hasn't saved this place as "Want to Go". `user_spot` will be `null` if the user hasn't created a spot for this place.

#### GET /api/v1/places/:placeId/questions
**Description:** Get guided questions for creating a spot at this place (optional endpoint for mobile apps to pre-populate spot creation form)

**Response (200 OK):**
```json
{
  "questions": [
    {
      "id": "vibe",
      "question": "What's the vibe?",
      "type": "text",
      "required": false,
      "placeholder": "Describe the atmosphere and energy of this place",
      "order": 1
    },
    {
      "id": "must_order",
      "question": "What's the one dish you must order?",
      "type": "text",
      "required": false,
      "placeholder": "e.g., The truffle pasta, Wagyu burger",
      "order": 2
    },
    {
      "id": "price_range",
      "question": "Price range?",
      "type": "select",
      "required": false,
      "options": ["$ - Budget friendly", "$$ - Moderate", "$$$ - Upscale", "$$$$ - Fine dining"],
      "order": 3
    }
  ],
  "category": "restaurant",
  "defaultQuestions": true
}
```

**Note:** Returns questions based on the place's Foursquare category. Includes both default questions (that apply to all categories) and category-specific questions. Questions are ordered by `displayOrder`.

#### GET /api/v1/map/pins
**Description:** Get map pins for current viewport (BRD Section 4.2, PRD Feature 2.1)

**Query Parameters:**
- `north` (required): Northern boundary latitude
- `south` (required): Southern boundary latitude
- `east` (required): Eastern boundary longitude
- `west` (required): Western boundary longitude
- `zoom`: Map zoom level (for clustering)

**Response (200 OK):**
```json
{
  "pins": [
    {
      "place_id": "uuid",
      "latitude": 40.7282,
      "longitude": -73.9942,
      "pin_type": "spot", // "spot", "want_to_go", "network"
      "spot_count": 3 // Number of network spots at this location
    }
  ],
  "clusters": [
    {
      "latitude": 40.7282,
      "longitude": -73.9942,
      "count": 15
    }
  ]
}
```

### 5.5 Spots Endpoints

#### POST /api/v1/spots
**Description:** Create a new spot (BRD Section 4.3, PRD Feature 3.2)

**Request Body:**
```json
{
  "place_id": "uuid",
  "rating": 5,
  "notes": "Amazing pizza!",
  "tags": ["pizza", "classic", "nyc"],
  "photos": ["https://s3.../photo1.jpg"],
  "guided_questions": {
    "vibe": "Cozy and authentic",
    "must_order": "Plain slice",
    "best_time": "Late night"
  }
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "place_id": "uuid",
  "rating": 5,
  "notes": "Amazing pizza!",
  "tags": ["pizza", "classic"],
  "photos": ["https://..."],
  "created_at": "2024-01-15T10:00:00Z"
}
```

#### GET /api/v1/spots/:spotId
**Description:** Get a specific spot

**Response (200 OK):**
```json
{
  "id": "uuid",
  "place": { ... },
  "user": { ... },
  "rating": 5,
  "notes": "Amazing pizza!",
  "tags": ["pizza"],
  "photos": ["https://..."],
  "created_at": "2024-01-15T10:00:00Z"
}
```

#### PATCH /api/v1/spots/:spotId
**Description:** Update a spot (only by owner)

#### DELETE /api/v1/spots/:spotId
**Description:** Delete a spot (only by owner)

### 5.6 Want to Go Endpoints

#### POST /api/v1/want-to-go
**Description:** Save a location as "Want to Go" (BRD Section 4.4, PRD Feature 3.1)

**Request Body:**
```json
{
  "place_id": "uuid",
  "notes": "Optional note about why I want to visit this place"
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "place_id": "uuid",
  "notes": "Optional note about why I want to visit this place",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

#### GET /api/v1/want-to-go
**Description:** Get user's "Want to Go" list

**Query Parameters:**
- `limit`: Results per page (default: 50)
- `offset`: Pagination offset

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "uuid",
      "place": {
        "id": "uuid",
        "name": "Joe's Pizza",
        "latitude": 40.7282,
        "longitude": -73.9942,
        "categories": ["Pizza Place"]
      },
      "notes": "Heard great things about this place",
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 25,
  "limit": 50,
  "offset": 0
}
```

#### GET /api/v1/want-to-go/:wantToGoId
**Description:** Get a specific "Want to Go" item

**Response (200 OK):**
```json
{
  "id": "uuid",
  "place": {
    "id": "uuid",
    "name": "Joe's Pizza",
    "latitude": 40.7282,
    "longitude": -73.9942,
    "categories": ["Pizza Place"]
  },
  "notes": "Heard great things about this place",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

#### PATCH /api/v1/want-to-go/:wantToGoId
**Description:** Update a "Want to Go" item (e.g., update notes)

**Request Body:**
```json
{
  "notes": "Updated note about why I want to visit"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "place_id": "uuid",
  "notes": "Updated note about why I want to visit",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-16T10:00:00Z"
}
```

#### DELETE /api/v1/want-to-go/:wantToGoId
**Description:** Remove a location from "Want to Go" list

**Response (204 No Content)**

#### POST /api/v1/want-to-go/:wantToGoId/convert-to-spot
**Description:** Convert "Want to Go" to "Spot" (BRD Section 4.4, User Flow 5.6)

**Request Body:**
```json
{
  "rating": 5,
  "notes": "...",
  "tags": ["..."],
  "photos": ["..."]
}
```

### 5.7 Playlists Endpoints

#### GET /api/v1/playlists
**Description:** Get playlists (with filters)

**Query Parameters:**
- `user_id`: Filter by user
- `is_published`: Filter published only
- `limit`, `offset`: Pagination

#### POST /api/v1/playlists
**Description:** Create a new playlist (BRD Section 4.3, PRD Feature 3.3)

**Request Body:**
```json
{
  "title": "My Top 5 Pizza Spots",
  "description": "The best pizza in NYC",
  "cover_image_url": "https://...",
  "spot_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response (201 Created):**
```json
{
  "id": "uuid",
  "title": "My Top 5 Pizza Spots",
  "description": "The best pizza in NYC",
  "cover_image_url": "https://...",
  "is_published": false,
  "created_at": "2024-01-15T10:00:00Z",
  "spots": [ ... ]
}
```

#### GET /api/v1/playlists/:playlistId
**Description:** Get playlist details (PRD Feature 2.3)

#### PATCH /api/v1/playlists/:playlistId
**Description:** Update playlist

#### POST /api/v1/playlists/:playlistId/publish
**Description:** Publish a playlist (BRD Section 4.3)

#### DELETE /api/v1/playlists/:playlistId
**Description:** Delete/unpublish a playlist

### 5.8 Social & Following Endpoints

#### POST /api/v1/follows
**Description:** Follow a user (BRD Section 4.5, PRD Feature 4.1)

**Request Body:**
```json
{
  "followee_id": "uuid"
}
```

**Response (201 Created or 200 OK):**
```json
{
  "id": "uuid",
  "follower_id": "uuid",
  "followee_id": "uuid",
  "status": "active" // or "pending" for private users
}
```

#### DELETE /api/v1/follows/:followId
**Description:** Unfollow a user

#### GET /api/v1/follows/requests
**Description:** Get pending follow requests (for private users)

#### POST /api/v1/follows/requests/:requestId/approve
**POST /api/v1/follows/requests/:requestId/deny
**Description:** Approve/deny follow request (BRD Section 4.5)

### 5.9 Feed Endpoints

#### GET /api/v1/feed
**Description:** Get chronological feed (BRD Section 4.5, PRD Feature 4.2)

**Query Parameters:**
- `limit`: Items per page (default: 20)
- `cursor`: Cursor for pagination (timestamp)

**Response (200 OK):**
```json
{
  "items": [
    {
      "type": "playlist",
      "id": "uuid",
      "playlist": {
        "id": "uuid",
        "title": "My Top 5 Pizza Spots",
        "cover_image_url": "https://...",
        "spot_count": 5
      },
      "author": {
        "id": "uuid",
        "username": "chloe_tastemaker",
        "profile_picture_url": "https://..."
      },
      "created_at": "2024-01-15T10:00:00Z"
    },
    {
      "type": "spot",
      "id": "uuid",
      "spot": {
        "id": "uuid",
        "place": {
          "name": "Joe's Pizza",
          "categories": ["Pizza Place"]
        },
        "rating": 5,
        "notes": "Amazing!",
        "tags": ["pizza"],
        "photos": ["https://..."]
      },
      "author": { ... },
      "created_at": "2024-01-14T15:00:00Z"
    }
  ],
  "next_cursor": "2024-01-14T15:00:00Z",
  "has_more": true
}
```

### 5.10 Onboarding Endpoints

#### GET /api/v1/onboarding/creators
**Description:** Get featured launch creators (BRD Section 4.2, User Flow 5.1)

**Response (200 OK):**
```json
{
  "creators": [
    {
      "id": "uuid",
      "username": "chloe_tastemaker",
      "bio": "Food blogger",
      "profile_picture_url": "https://...",
      "playlist_count": 12
    }
  ]
}
```

#### POST /api/v1/onboarding/complete
**Description:** Mark onboarding as complete (after following creators)

**Request Body:**
```json
{
  "followed_creator_ids": ["uuid1", "uuid2", "uuid3"]
}
```

### 5.11 Error Response Format

All error responses follow this structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... } // Optional additional context
  }
}
```

**Common HTTP Status Codes:**
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate username)
- `422 Unprocessable Entity`: Validation errors
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## 6. Security Considerations

### 6.1 Authentication & Authorization

**Password Security** (Referencing BRD Section 6, Security)
- **Hashing Algorithm:** bcrypt with cost factor 12
- **Salt:** Unique salt per password (handled by bcrypt)
- **Password Requirements:** Minimum 8 characters, complexity requirements (enforced client and server-side)
- **Password Reset:** Secure token-based flow with expiration (15 minutes)

**JWT Token Management** (Referencing PRD Section 5, Security)
- **Access Token:** Short-lived (15 minutes), contains user ID and role
- **Refresh Token:** Long-lived (7 days), stored securely in database
- **Token Storage:** 
  - iOS: Keychain Services
  - Android: EncryptedSharedPreferences or Keystore
- **Token Rotation:** Refresh tokens rotated on each use
- **Revocation:** Blacklist invalidated tokens in Redis

**OAuth Security (v1.1)**
- **Note:** OAuth security considerations apply to v1.1 when Google/Apple Sign-In is implemented
- **State Parameter:** CSRF protection for OAuth flows
- **Token Storage:** Encrypt OAuth tokens at rest (AES-256)
- **Token Refresh:** Automatic refresh before expiration

**Authorization**
- **Role-Based Access Control (RBAC):** Enforce creator vs. consumer permissions
- **Resource Ownership:** Verify user owns resource before modification/deletion
- **Private Profile Access:** Enforce follow relationship for private profiles

### 6.2 Data Protection

**Data Encryption**
- **In Transit:** TLS 1.3 for all API communications
- **Certificate Pinning:** Implement on mobile clients to prevent MITM attacks
- **At Rest:** 
  - Database: Enable encryption at rest (AWS RDS encryption)
  - Sensitive Fields: Encrypt PII in database (OAuth tokens will be encrypted in v1.1)

**Input Validation & Sanitization** (Referencing PRD Section 5, Security)
- **XSS Prevention:** Sanitize all user-generated content (HTML escaping)
- **SQL Injection Prevention:** Use parameterized queries (ORM handles this)
- **Input Validation:** Validate all inputs with schema validation (Zod/Joi)
- **File Upload Security:**
  - Validate file types (images only: JPEG, PNG, WebP)
  - Scan for malware
  - Limit file size (5MB per image)
  - Store in S3 with public-read ACL only for approved content

**Location Privacy** (Referencing BRD Section 6, Security)
- **Explicit Consent:** Request location permission only when needed
- **No Background Tracking:** Location only sent when app is active
- **Data Minimization:** Only store location when user saves a place
- **User Control:** Allow users to delete location data

### 6.3 API Security

**Rate Limiting**
- **Per User:** 100 requests per minute for authenticated users
- **Per IP:** 20 requests per minute for unauthenticated endpoints
- **Burst Allowance:** Allow short bursts, then throttle
- **Implementation:** Redis-based rate limiting

**API Key Management**
- **External APIs:** Store API keys in environment variables, never in code
- **Key Rotation:** Regular rotation schedule for external service keys
- **Secrets Management:** Use AWS Secrets Manager or equivalent

**CORS Policy**
- **Allowed Origins:** Only mobile app bundle IDs and approved web domains
- **Methods:** GET, POST, PUT, PATCH, DELETE
- **Headers:** Authorization, Content-Type

### 6.4 Compliance & Privacy

**GDPR Compliance** (Referencing PRD Section 5, Security)
- **Data Subject Rights:** 
  - Right to access (export user data)
  - Right to deletion (DELETE /api/v1/users/me with cascade)
  - Right to rectification (PATCH endpoints)
- **Privacy Policy:** Clear, accessible privacy policy
- **Data Processing:** Document lawful basis for processing
- **Data Retention:** Define retention policies (e.g., delete inactive accounts after 2 years)

**Data Minimization**
- **Collect Only Necessary Data:** Per BRD Section 6, only essential place data fields
- **Purpose Limitation:** Use data only for stated purposes
- **Storage Limitation:** Delete data when no longer needed

### 6.5 Infrastructure Security

**Network Security**
- **VPC:** Isolate backend services in private subnets
- **Security Groups:** Restrict inbound/outbound traffic
- **WAF:** Web Application Firewall for API Gateway (if using)

**Database Security**
- **Connection Encryption:** Require SSL for database connections
- **Access Control:** Least privilege principle for database users
- **Backup Encryption:** Encrypt database backups
- **Audit Logging:** Log all database access

**Monitoring & Incident Response**
- **Security Logging:** Log all authentication attempts, failed requests
- **Intrusion Detection:** Monitor for suspicious patterns
- **Incident Response Plan:** Document procedures for security incidents
- **Vulnerability Scanning:** Regular scans of dependencies

---

## 7. Scalability and Performance Requirements

### 7.1 Performance Targets

**API Performance** (Referencing PRD Section 5, Performance)
- **Target Response Time:** < 400ms for 95th percentile of requests
- **Critical Endpoints:**
  - Map pins: < 300ms
  - Feed: < 400ms
  - Place search: < 500ms (includes external API call)
- **Database Query Time:** < 100ms for 95th percentile

**Mobile App Performance** (Referencing BRD Section 6, Performance)
- **Cold Start:** < 4 seconds (BRD Section 6, PRD Section 5)
- **Screen Load Time:** < 3 seconds on 4G (BRD Section 6)
- **Map Performance:** Smooth scrolling/zooming with 500+ pins (BRD Section 6)
- **Image Loading:** Progressive loading, thumbnails first

**External API Performance**
- **Place Data API:** Cache responses for 30 days (places rarely change)
- **Map Tiles:** CDN-cached, < 200ms load time

### 7.2 Scalability Targets

**User Capacity** (Referencing PRD Section 5, Scalability)
- **Initial Target:** 10,000 concurrent users without degradation
- **Growth Plan:** Scale to 100,000+ users with horizontal scaling

**Data Volume Estimates (Year 1)**
- **Users:** 10,000 users
- **Spots:** ~50,000 spots (5 per user average)
- **Playlists:** ~5,000 playlists
- **Places:** ~20,000 unique places (many users share same places)
- **Feed Items:** ~100,000 items (10 per user average)

### 7.3 Scalability Architecture

**Horizontal Scaling**
- **Backend Services:** Stateless API servers, scale horizontally with load balancer
- **Database:** Start with single instance, add read replicas as needed
- **Cache Layer:** Redis cluster for high availability

**Database Optimization**
- **Indexing Strategy:** 
  - Index all foreign keys
  - Composite indexes for common queries (e.g., `(user_id, created_at DESC)`)
  - Full-text indexes for search
  - Geospatial indexes for location queries (PostGIS)
- **Query Optimization:**
  - Use EXPLAIN ANALYZE to optimize slow queries
  - Avoid N+1 queries (use eager loading)
  - Pagination for all list endpoints
- **Connection Pooling:** Configure appropriate pool size (e.g., 20 connections per server)

**Caching Strategy**
- **Redis Cache Layers:**
  1. **Session Cache:** JWT refresh tokens (TTL: 7 days)
  2. **User Profile Cache:** Frequently accessed profiles (TTL: 1 hour)
  3. **Place Data Cache:** External place data (TTL: 30 days)
  4. **Feed Cache:** Recent feed items (TTL: 24 hours)
  5. **Map Pins Cache:** Viewport-based pin data (TTL: 5 minutes)
- **Cache Invalidation:** 
  - Invalidate on write (user updates profile → invalidate profile cache)
  - TTL-based expiration for time-sensitive data

**CDN Strategy**
- **Static Assets:** Serve images via CDN (CloudFront)
- **Image Optimization:**
  - Generate multiple sizes (thumbnail, medium, full)
  - Use WebP format with JPEG fallback
  - Lazy loading in mobile apps

**Database Scaling Path**
1. **Phase 1 (0-10K users):** Single PostgreSQL instance
2. **Phase 2 (10K-50K users):** Add read replica for read-heavy queries
3. **Phase 3 (50K+ users):** Consider sharding by user_id or geographic region

### 7.4 Performance Optimization Techniques

**Backend Optimizations**
- **Async Processing:** Use background jobs for non-critical tasks (e.g., feed generation)
- **Batch Operations:** Batch database writes where possible
- **Lazy Loading:** Load related data only when needed
- **Compression:** Gzip/Brotli compression for API responses

**Mobile App Optimizations**
- **Offline Support:** Cache essential data locally (Core Data/Room)
- **Lazy Loading:** Load images and data as user scrolls
- **Request Batching:** Batch multiple API calls where possible
- **Prefetching:** Prefetch likely-needed data (e.g., next page of feed)

**Map Performance** (Referencing BRD Section 6)
- **Pin Clustering:** Cluster pins at low zoom levels
- **Viewport-Based Loading:** Only load pins in visible area + buffer
- **Progressive Loading:** Load high-priority pins first (user's own spots)
- **Debouncing:** Debounce map movement events before API calls

### 7.5 Monitoring & Performance Tracking

**Key Metrics to Monitor**
- **API Response Times:** P50, P95, P99 percentiles
- **Database Query Times:** Slow query log
- **Error Rates:** 4xx and 5xx error rates
- **Throughput:** Requests per second
- **Cache Hit Rates:** Redis cache hit percentage
- **Mobile App Metrics:**
  - Cold start time
  - Screen load times
  - Crash rate
  - ANR (Android) / Freeze rate (iOS)

**Tools**
- **APM:** DataDog, New Relic, or AWS X-Ray
- **Logging:** Centralized logging (CloudWatch, ELK stack)
- **Database Monitoring:** PostgreSQL performance insights
- **Mobile Analytics:** Firebase Analytics, Mixpanel, or Amplitude

---

## 8. Integration Points

### 8.1 Map Visualization Service: Mapbox

**Integration Details** (Referencing BRD Section 6, Data & External Services)
- **Service:** Mapbox Maps SDK
- **Purpose:** Map rendering, pin display, custom styling
- **Authentication:** Mapbox access token (stored securely)
- **Customization Requirements:** 
  - Custom map styles (colors, fonts) per BRD Section 6
  - Custom pin icons for different pin types (Spot, Want to Go, Network)
- **Data Flow:**
  1. Mobile app requests map tiles from Mapbox
  2. App overlays custom pins from our API
  3. Map interactions trigger API calls to our backend

**Rate Limits:** 
- Map tile requests: Generous limits for standard usage
- Geocoding: Separate API, rate-limited

**Cost Considerations:**
- Pay-per-use pricing model
- Estimate: ~$0.50 per 1,000 map loads
- Optimization: Cache map tiles, minimize unnecessary tile requests

### 8.2 Place Data Service: Foursquare Places API

**Integration Details** (Referencing BRD Section 6, Essential Data Fields)
- **Service:** Foursquare Places API (Places API v3)
- **Purpose:** Place search, place details, place data
- **Authentication:** API key + secret (OAuth 2.0)
- **Essential Data Fields** (per BRD Section 6):
  - Unique ID (fsq_id - permanent identifier)
  - Name
  - Latitude/Longitude
  - Categories (detailed, e.g., "Taco Place", "Coffee Shop")
- **Additional Fields (Optional but Recommended):**
  - Address
  - Phone number
  - Website
  - Hours of operation

**Data Flow:**
1. User searches for place → Backend calls Foursquare Search API
2. Backend stores place in our database with external_place_id
3. Subsequent requests use cached data (30-day TTL)
4. Periodic sync to update place data (if needed)

**Rate Limits:**
- Standard tier: 50,000 calls/day
- Consider upgrading for higher volume

**Cost Considerations:**
- Freemium model with paid tiers
- Estimate: $0.01-0.02 per API call
- Optimization: Aggressive caching (30 days), batch requests where possible

**Alternative:** Google Places API (more expensive but comprehensive)

### 8.3 Media Storage: AWS S3 + CloudFront

**Integration Details**
- **Service:** AWS S3 for storage, CloudFront for CDN
- **Purpose:** User-uploaded images (profile pictures, spot photos, playlist covers)
- **Bucket Structure:**
  ```
  s3://echo-media/
    profiles/{user_id}/{timestamp}.jpg
    spots/{spot_id}/{timestamp}.jpg
    playlists/{playlist_id}/cover.jpg
  ```
- **Access Control:**
  - Private bucket
  - Pre-signed URLs for uploads (15-minute expiration)
  - Public-read URLs for published content (after moderation, if needed)

**Image Processing:**
- **Service:** AWS Lambda + Sharp (or ImageMagick)
- **Process:** Generate thumbnails (200x200, 800x800) on upload
- **Formats:** Store as WebP, serve with JPEG fallback

**CDN Configuration:**
- CloudFront distribution for S3 bucket
- Cache headers: 1 year for images (with versioning in URL)
- Compression: Enable Gzip/Brotli

### 8.4 Future Integrations (Post-MVP)

**Social Sign-In (Google/Apple)** (BRD Section 3, Out-of-Scope; PRD Section 7, P1)
- **Service:** 
  - Google OAuth 2.0
  - Apple Sign-In (iOS only)
- **Purpose:** Simplify user registration and login process
- **Integration:** 
  - iOS: Google Sign-In SDK, Apple ASAuthorizationController
  - Android: Google Sign-In SDK
  - Backend: Verify ID tokens server-side
- **Data Retrieved:**
  - Email, Name, Profile picture URL
- **Security:** Verify token signatures, check audience claims
- **Timeline:** v1.1

**Google Maps Import** (BRD Section 3, Out-of-Scope; PRD Section 7, P1)
- **Service:** Google My Maps API or Google Takeout
- **Purpose:** Import user's saved places from Google Maps
- **Implementation:** 
  - OAuth flow to access user's Google account
  - Parse Google Maps saved places
  - Import as "Want to Go" locations (default)
- **Timeline:** v1.1 (fast-follow release)

**Push Notifications** (PRD Section 7, P2)
- **Service:** 
  - iOS: Apple Push Notification Service (APNs)
  - Android: Firebase Cloud Messaging (FCM)
- **Purpose:** Notify users of new content, follow requests, etc.

**Analytics Services**
- **Service:** Firebase Analytics, Mixpanel, or Amplitude
- **Purpose:** Track user behavior, measure KPIs (PRD Section 1, Success Metrics)

---

## 9. Development Phases and Milestones

### 9.1 Development Methodology

**AI Agent Task Execution Approach:**
- Each task is a discrete, actionable unit that can be completed independently
- Tasks include specific file paths, function names, and implementation details
- Dependencies are clearly marked - complete prerequisite tasks first
- Each task should be testable and verifiable
- Follow the existing code patterns and architecture decisions

### 9.2 Phase Breakdown

#### **Phase 1: Foundation & Infrastructure**

**Prerequisites:** None

**Task 1.1: Initialize Backend Project Structure**
- [ ] Create `backend/` directory
- [ ] Initialize Node.js project with `package.json` (TypeScript, Express.js)
- [ ] Create directory structure: `src/controllers/`, `src/services/`, `src/models/`, `src/routes/`, `src/middleware/`, `src/utils/`, `src/config/`
- [ ] Set up TypeScript configuration (`tsconfig.json`)
- [ ] Create `.env.example` file with required environment variables
- [ ] Add `.gitignore` for Node.js projects

**Task 1.2: Set Up Database and ORM**
- [ ] Install PostgreSQL locally or set up Docker container
- [ ] Install Prisma ORM: `npm install prisma @prisma/client`
- [ ] Initialize Prisma: `npx prisma init`
- [ ] Create `prisma/schema.prisma` with database connection
- [ ] Create initial migration directory structure
- [ ] Set up database connection utility in `src/config/database.ts`

**Task 1.3: Implement Database Schema - Core Tables**
- [ ] Create `users` table migration (see Section 4.2.1 for schema)
- [ ] Create `places` table migration (see Section 4.2.3)
- [ ] **Note:** `oauth_accounts` table is reserved for v1.1 (see Section 4.2.2) - skip for MVP
- [ ] Run migrations: `npx prisma migrate dev --name init_core_tables`
- [ ] Generate Prisma Client: `npx prisma generate`
- [ ] Create Prisma client singleton in `src/config/prisma.ts`

**Task 1.4: Set Up Express Server and Middleware**
- [ ] Create `src/server.ts` with Express app initialization
- [ ] Install dependencies: `express`, `cors`, `helmet`, `morgan`, `dotenv`
- [ ] Create middleware for CORS, security headers (helmet), request logging (morgan)
- [ ] Create error handling middleware in `src/middleware/errorHandler.ts`
- [ ] Create 404 handler middleware
- [ ] Set up environment variable validation in `src/config/env.ts`

**Task 1.5: Implement User Registration Endpoint**
- [ ] Create `src/controllers/authController.ts` with `register` function
- [ ] Create `src/services/authService.ts` with `registerUser` function
- [ ] Create `src/routes/authRoutes.ts` with `POST /api/v1/auth/register` route
- [ ] Implement password hashing using bcrypt (cost factor 12)
- [ ] Add input validation using Zod schema in `src/validators/authValidator.ts`
- [ ] Handle duplicate email/username errors (409 Conflict)
- [ ] Return JWT tokens on successful registration
- [ ] Write unit tests in `src/__tests__/auth.test.ts`

**Task 1.6: Implement User Login Endpoint**
- [ ] Add `login` function to `authController.ts`
- [ ] Add `loginUser` function to `authService.ts`
- [ ] Add `POST /api/v1/auth/login` route to `authRoutes.ts`
- [ ] Implement password verification using bcrypt
- [ ] Generate JWT access token (15 min expiry) and refresh token (7 days)
- [ ] Store refresh token in database (create `refresh_tokens` table if needed)
- [ ] Return user object and tokens on success
- [ ] Handle invalid credentials (401 Unauthorized)
- [ ] Write unit tests

**Task 1.7: Implement JWT Authentication Middleware**
- [ ] Install `jsonwebtoken` and `@types/jsonwebtoken`
- [ ] Create `src/middleware/authMiddleware.ts` with `authenticateToken` function
- [ ] Extract Bearer token from `Authorization` header
- [ ] Verify JWT signature and expiration
- [ ] Attach user object to `req.user` for authenticated requests
- [ ] Handle token errors (401 Unauthorized)
- [ ] Create protected route example/test

**Task 1.8: Set Up CI/CD Pipeline**
- [ ] Create `.github/workflows/ci.yml` for GitHub Actions
- [ ] Configure workflow to run on push to main and PRs
- [ ] Add steps: install dependencies, run linter, run tests, build TypeScript
- [ ] Set up test database for CI environment
- [ ] Configure environment secrets in GitHub repository settings

**Task 1.9: Set Up Development Environment**
- [ ] Create `docker-compose.yml` for local development (PostgreSQL, Redis)
- [ ] Create `Dockerfile` for backend service
- [ ] Add scripts to `package.json`: `dev`, `build`, `start`, `test`, `migrate`
- [ ] Create `.env.development` file template
- [ ] Document setup instructions in `README.md`

**Milestone:** Backend server running, users can register/login via API, JWT authentication working

**Reference:** BRD Section 4.1, PRD Feature 1.1, API Section 5.2

---

#### **Phase 2: Core User Features**

**Prerequisites:** Phase 1 complete

**Task 2.1: Implement User Profile Endpoints**
- [ ] Create `src/controllers/userController.ts` with `getCurrentUser`, `updateUser` functions
- [ ] Create `src/services/userService.ts` with `getUserById`, `updateUser` functions
- [ ] Create `src/routes/userRoutes.ts` with `GET /api/v1/users/me` and `PATCH /api/v1/users/me`
- [ ] Add authentication middleware to user routes
- [ ] Implement username uniqueness check on update
- [ ] Add input validation for profile fields (username, bio)
- [ ] Write unit tests for profile endpoints

**Task 2.2: Implement Profile Picture Upload**
- [ ] Install `multer` and `@types/multer` for file uploads
- [ ] Install AWS SDK: `@aws-sdk/client-s3`
- [ ] Create `src/config/s3.ts` with S3 client configuration
- [ ] Create `src/middleware/uploadMiddleware.ts` for image upload handling
- [ ] Create `src/services/imageService.ts` with `uploadImage` function
- [ ] Add `POST /api/v1/users/me/avatar` endpoint for profile picture upload
- [ ] Validate image file type (JPEG, PNG, WebP) and size (max 5MB)
- [ ] Generate S3 pre-signed URL or upload directly
- [ ] Update user record with image URL
- [ ] Write tests for image upload

**Note:** OAuth integration (Google/Apple Sign-In) is moved to v1.1. MVP supports email/password authentication only.

**Task 2.3: Implement Place Search API (Foursquare Integration)**
- [ ] Install `axios` for HTTP requests
- [ ] Create `src/services/foursquareService.ts` with Foursquare API client
- [ ] Create abstraction layer `src/services/placeDataService.ts` (interface for place providers)
- [ ] Implement `searchPlaces` function calling Foursquare Places API
- [ ] Add `GET /api/v1/places/search` endpoint in `src/routes/placeRoutes.ts`
- [ ] Parse and normalize Foursquare response to our format
- [ ] Extract only essential fields: id, name, lat, lng, categories
- [ ] Add query parameter validation (q, lat, lng, limit)
- [ ] Handle API errors and rate limiting
- [ ] Write unit tests with mocked Foursquare responses

**Task 2.4: Implement Place Caching**
- [ ] Install `ioredis` for Redis client
- [ ] Create `src/config/redis.ts` with Redis connection
- [ ] Create `src/services/cacheService.ts` with cache helper functions
- [ ] Implement caching in `placeDataService.ts`: cache Foursquare responses for 30 days
- [ ] Cache key format: `place:external_id:{foursquare_id}`
- [ ] Check cache before calling Foursquare API
- [ ] Write cache on successful API response
- [ ] Add cache invalidation strategy (if needed)

**Task 2.5: Implement Place Detail Endpoint**
- [ ] Add `GET /api/v1/places/:placeId` endpoint
- [ ] Check if place exists in database (by external_place_id or our UUID)
- [ ] If not in DB, fetch from Foursquare and store in `places` table
- [ ] Return place details with essential fields
- [ ] Add error handling for place not found (404)
- [ ] Write unit tests

**Task 2.6: Implement Place Storage in Database**
- [ ] Create `src/services/placeService.ts` with `getOrCreatePlace` function
- [ ] Implement logic: check DB first, if not found fetch from Foursquare, store in DB
- [ ] Handle duplicate external_place_id conflicts
- [ ] Update `places` table with cached_data JSONB field
- [ ] Add `cached_at` timestamp tracking

**Milestone:** Users can create/update profiles, upload profile pictures, and search for places

**Reference:** BRD Section 4.1, PRD Feature 1, API Section 5.3, 5.4

---

#### **Phase 3: Content Creation - Spots & Want to Go**

**Prerequisites:** Phase 2 complete

**Task 3.1: Implement Database Schema for Spots and Want to Go**
- [ ] Create `spots` table migration (see Section 4.2.4)
- [ ] Create `want_to_go` table migration with `notes` field (see Section 4.2.5)
- [ ] Run migrations: `npx prisma migrate dev --name add_spots_and_want_to_go`
- [ ] Update Prisma schema file
- [ ] Generate Prisma Client

**Task 3.2: Implement Create Spot Endpoint**
- [ ] Create `src/controllers/spotController.ts` with `createSpot` function
- [ ] Create `src/services/spotService.ts` with `createSpot` function
- [ ] Create `src/routes/spotRoutes.ts` with `POST /api/v1/spots` route
- [ ] Add authentication middleware
- [ ] Validate input: place_id (required), rating (1-5, required), notes (optional), tags (array), photos (array), guided_questions (object, optional)
- [ ] Validate guided_questions structure: object with questionId keys and answer values
- [ ] Check that place exists in database
- [ ] Enforce unique constraint: one spot per user per place
- [ ] Store guided_questions as JSONB in spots table
- [ ] Return created spot with place details (including guided_questions)
- [ ] Write unit tests

**Task 3.3: Implement Guided Questions System**
- [ ] Review guided questions templates in `documents/guided-questions-templates.json`
- [ ] Add `GuidedQuestionTemplate` model to Prisma schema (see `documents/guided-questions-schema.prisma` for reference)
  - Fields: id, category, displayName, questionId, questionText, questionType, isRequired, placeholder, options (JSON), displayOrder, foursquareCategories (String[]), createdAt, updatedAt
  - Add indexes on category and questionId
- [ ] Create migration: `npx prisma migrate dev --name add_guided_question_templates`
- [ ] Copy seed script from `documents/seed-guided-questions.ts` to `prisma/seed-guided-questions.ts` (or integrate into main seed file)
- [ ] Update main seed file to call guided questions seed function, or run separately
- [ ] Run seed script to populate database with question templates from JSON file
- [ ] Create `src/services/guidedQuestionsService.ts` with the following functions:
  - `getQuestionsForCategory(category: string, foursquareCategory?: string): Promise<QuestionTemplate[]>` - Get questions for a specific category, including default questions
  - `getDefaultQuestions(): Promise<QuestionTemplate[]>` - Get default questions that apply to all categories
  - `mapFoursquareCategoryToTemplate(foursquareCategory: string): string` - Map Foursquare category to our template category (restaurant, fitness, beauty, bars_and_clubs, culture_attractions, nature)
- [ ] Implement category mapping logic:
  - Check if place's Foursquare category matches any template's `foursquareCategories` array
  - Return matching template category, or fall back to default questions only
- [ ] Update `createSpot` endpoint/service to:
  - Accept `guided_questions` object in request body (key-value pairs: questionId -> answer)
  - Validate that provided question IDs exist in templates
  - Store `guided_questions` as JSONB in `spots.guided_questions` field
- [ ] Create optional endpoint `GET /api/v1/places/:placeId/questions` to return relevant questions for a place (for mobile app to pre-populate form)
- [ ] Write unit tests for `guidedQuestionsService.ts`:
  - Test category mapping
  - Test question retrieval for each category
  - Test default questions inclusion
- [ ] Write integration tests for spot creation with guided questions

**Task 3.4: Implement Spot Image Upload**
- [ ] Add image upload handling to spot creation endpoint
- [ ] Create `src/services/spotImageService.ts` for spot-specific image handling
- [ ] Upload images to S3: `s3://echo-media/spots/{spot_id}/{timestamp}.jpg`
- [ ] Generate multiple sizes (thumbnail, medium) using Sharp or Lambda
- [ ] Store image URLs in spot's `photos` JSONB array
- [ ] Validate image count (max 5 photos per spot)
- [ ] Write tests for image upload

**Task 3.5: Implement Want to Go Endpoints**
- [ ] Add `createWantToGo` function to `src/controllers/wantToGoController.ts`
- [ ] Add `createWantToGo` function to `src/services/wantToGoService.ts`
- [ ] Create `src/routes/wantToGoRoutes.ts` with `POST /api/v1/want-to-go` route
- [ ] Accept `place_id` (required) and `notes` (optional) in request body
- [ ] Enforce unique constraint: one want-to-go per user per place
- [ ] Return created want-to-go item
- [ ] Add `GET /api/v1/want-to-go` endpoint to list user's want-to-go items
- [ ] Add `GET /api/v1/want-to-go/:wantToGoId` endpoint
- [ ] Add `PATCH /api/v1/want-to-go/:wantToGoId` endpoint to update notes
- [ ] Add `DELETE /api/v1/want-to-go/:wantToGoId` endpoint
- [ ] Write unit tests for all endpoints

**Task 3.6: Implement Convert Want to Go to Spot**
- [ ] Add `convertToSpot` function to `wantToGoController.ts`
- [ ] Add `POST /api/v1/want-to-go/:wantToGoId/convert-to-spot` route
- [ ] Validate that want-to-go item belongs to authenticated user
- [ ] Accept rating, notes, tags, photos in request body
- [ ] Create new spot with provided data
- [ ] Delete the want-to-go item (or mark as converted)
- [ ] Return created spot
- [ ] Write unit tests

**Task 3.7: Implement Spot Update and Delete**
- [ ] Add `updateSpot` function to `spotController.ts` and `spotService.ts`
- [ ] Add `PATCH /api/v1/spots/:spotId` route
- [ ] Verify spot ownership before allowing update
- [ ] Allow updating: rating, notes, tags, photos, guided_questions
- [ ] Add `deleteSpot` function
- [ ] Add `DELETE /api/v1/spots/:spotId` route
- [ ] Verify ownership, then soft delete or hard delete
- [ ] Write unit tests

**Task 3.8: Update Place Detail Endpoint to Include User Data**
- [ ] Update `GET /api/v1/places/:placeId` endpoint
- [ ] Query user's spot for this place (if exists)
- [ ] Query user's want-to-go for this place (if exists)
- [ ] Include `user_spot` and `user_want_to_go` in response (null if not found)
- [ ] Update response format (see API Section 5.4)
- [ ] Write tests

**Task 3.9: Implement User's Personal Map Data Endpoint**
- [ ] Create `GET /api/v1/map/my-locations` endpoint
- [ ] Return all user's spots and want-to-go items with place details
- [ ] Include latitude/longitude for map pin rendering
- [ ] Filter by viewport if query params provided (north, south, east, west)
- [ ] Return distinct pin types: "spot", "want_to_go"
- [ ] Write unit tests

**Milestone:** Users can create spots with ratings/notes/photos, save places as "Want to Go" with notes, convert want-to-go to spots, and view their personal map data

**Reference:** BRD Section 4.3, 4.4; PRD Feature 3; API Section 5.5, 5.6

---

#### **Phase 4: Playlists**

**Prerequisites:** Phase 3 complete

**Task 4.1: Implement Database Schema for Playlists**
- [ ] Create `playlists` table migration (see Section 4.2.6)
- [ ] Create `playlist_spots` junction table migration (see Section 4.2.7)
- [ ] Run migrations: `npx prisma migrate dev --name add_playlists`
- [ ] Update Prisma schema
- [ ] Generate Prisma Client

**Task 4.2: Implement Create Playlist Endpoint**
- [ ] Create `src/controllers/playlistController.ts` with `createPlaylist` function
- [ ] Create `src/services/playlistService.ts` with `createPlaylist` function
- [ ] Create `src/routes/playlistRoutes.ts` with `POST /api/v1/playlists` route
- [ ] Validate input: title (required, 1-255 chars), description (optional), cover_image_url (optional), spot_ids (array)
- [ ] Verify all spot_ids belong to authenticated user
- [ ] Create playlist record
- [ ] Create playlist_spots junction records with display_order
- [ ] Return created playlist with spots
- [ ] Write unit tests

**Task 4.3: Implement Playlist Cover Image Upload**
- [ ] Add image upload to playlist creation/update
- [ ] Upload to S3: `s3://echo-media/playlists/{playlist_id}/cover.jpg`
- [ ] Validate image (JPEG, PNG, WebP, max 5MB)
- [ ] Generate thumbnail version
- [ ] Store URL in playlist's `cover_image_url` field
- [ ] Write tests

**Task 4.4: Implement Add/Remove Spots from Playlist**
- [ ] Add `addSpotToPlaylist` function to `playlistService.ts`
- [ ] Add `removeSpotFromPlaylist` function
- [ ] Add `PATCH /api/v1/playlists/:playlistId/spots` route
- [ ] Accept action: "add" or "remove" with spot_id
- [ ] Verify playlist ownership
- [ ] Verify spot belongs to user
- [ ] Update display_order when adding
- [ ] Write unit tests

**Task 4.5: Implement Publish/Unpublish Playlist**
- [ ] Add `publishPlaylist` function to `playlistService.ts`
- [ ] Add `POST /api/v1/playlists/:playlistId/publish` route
- [ ] Set `is_published = true` and `published_at = NOW()`
- [ ] Verify playlist has at least one spot before publishing
- [ ] Add `POST /api/v1/playlists/:playlistId/unpublish` route (or use PATCH)
- [ ] Write unit tests

**Task 4.6: Implement Playlist Detail Endpoint**
- [ ] Add `getPlaylist` function to `playlistController.ts`
- [ ] Add `GET /api/v1/playlists/:playlistId` route
- [ ] Return playlist with all spots (ordered by display_order)
- [ ] Include place details for each spot
- [ ] Check visibility: only show published playlists to non-owners, or if user follows owner
- [ ] Write unit tests

**Task 4.7: Implement Playlist List Endpoints**
- [ ] Add `GET /api/v1/playlists` route with query filters
- [ ] Support filters: `user_id`, `is_published`
- [ ] Add pagination (limit, offset)
- [ ] Return playlists with spot counts
- [ ] Write unit tests

**Task 4.8: Implement Playlist Update Endpoint**
- [ ] Add `updatePlaylist` function to `playlistController.ts` and `playlistService.ts`
- [ ] Add `PATCH /api/v1/playlists/:playlistId` route
- [ ] Allow updating: title, description, cover_image_url
- [ ] Verify ownership
- [ ] Write unit tests

**Task 4.9: Implement Playlist Delete Endpoint**
- [ ] Add `deletePlaylist` function
- [ ] Add `DELETE /api/v1/playlists/:playlistId` route
- [ ] Verify ownership
- [ ] Cascade delete playlist_spots records
- [ ] Optionally delete cover image from S3
- [ ] Write unit tests

**Task 4.10: Update User Profile Endpoint to Include Playlists**
- [ ] Update `GET /api/v1/users/:userId` endpoint
- [ ] Include user's published playlists in response
- [ ] For private users, only show playlists to followers
- [ ] For creators, always show playlists (public profile)
- [ ] Write tests

**Milestone:** Users can create, edit, publish, and delete playlists; add/remove spots; view playlist details

**Reference:** BRD Section 4.3, PRD Feature 3.3, API Section 5.7

---

#### **Phase 5: Social Features - Following & Feed**

**Prerequisites:** Phase 4 complete

**Task 5.1: Implement Database Schema for Social Features**
- [ ] Create `follows` table migration (see Section 4.2.8)
- [ ] Create `feed_items` table migration (see Section 4.2.9)
- [ ] Run migrations: `npx prisma migrate dev --name add_social_features`
- [ ] Update Prisma schema
- [ ] Generate Prisma Client

**Task 5.2: Implement User Search Endpoint**
- [ ] Create `src/controllers/userController.ts` with `searchUsers` function
- [ ] Add `GET /api/v1/users/search` route with query parameter `q`
- [ ] Implement username search using PostgreSQL ILIKE or full-text search
- [ ] Add pagination (limit, offset)
- [ ] Return user profiles (username, profile_picture_url, role)
- [ ] Exclude private users from results unless searcher follows them
- [ ] Write unit tests

**Task 5.3: Implement Follow/Unfollow Endpoints**
- [ ] Create `src/services/followService.ts` with `followUser`, `unfollowUser` functions
- [ ] Add `POST /api/v1/follows` route (follow user)
- [ ] Validate: cannot follow self, user exists
- [ ] If followee is public: create follow with status "active"
- [ ] If followee is private: create follow with status "pending"
- [ ] Add `DELETE /api/v1/follows/:followId` route (unfollow)
- [ ] Write unit tests

**Task 5.4: Implement Follow Request Management**
- [ ] Add `GET /api/v1/follows/requests` endpoint (get pending requests for current user)
- [ ] Add `POST /api/v1/follows/requests/:requestId/approve` endpoint
- [ ] Add `POST /api/v1/follows/requests/:requestId/deny` endpoint
- [ ] Update follow status to "active" on approve, delete on deny
- [ ] Verify request belongs to current user
- [ ] Write unit tests

**Task 5.5: Implement Private Profile Enforcement**
- [ ] Update `GET /api/v1/users/:userId` endpoint
- [ ] Check if user is private
- [ ] If private and requester is not following: hide playlists, return limited profile
- [ ] Show "Follow Request" button state
- [ ] Update all user content endpoints to respect privacy
- [ ] Write unit tests

**Task 5.6: Implement Feed Generation Background Job**
- [ ] Install job queue library: `bull` or `agenda`
- [ ] Set up Redis connection for job queue
- [ ] Create `src/jobs/feedGenerationJob.ts`
- [ ] Implement job that runs when: playlist published, spot created
- [ ] For each new content item, create feed_items for all followers
- [ ] Insert into `feed_items` table with content_type and content_id
- [ ] Handle job failures and retries
- [ ] Write unit tests

**Task 5.7: Implement Feed Endpoint**
- [ ] Add `GET /api/v1/feed` endpoint
- [ ] Query `feed_items` table for current user, ordered by created_at DESC
- [ ] Join with playlists or spots based on content_type
- [ ] Include author information
- [ ] Implement cursor-based pagination (using created_at timestamp)
- [ ] Return formatted feed items (see API Section 5.9)
- [ ] Write unit tests

**Task 5.8: Trigger Feed Generation on Content Creation**
- [ ] Update `createSpot` service to trigger feed job
- [ ] Update `publishPlaylist` service to trigger feed job
- [ ] Only generate feed items for published playlists
- [ ] Only generate feed items for spots (not want-to-go)
- [ ] Test feed generation end-to-end

**Milestone:** Users can search and follow others, manage follow requests, see chronological feed, and control profile privacy

**Reference:** BRD Section 4.5, PRD Feature 4, API Section 5.8, 5.9

---

#### **Phase 6: Map Integration & Discovery**

**Prerequisites:** Phase 5 complete

**Task 6.1: Implement Map Pins API Endpoint**
- [ ] Create `src/controllers/mapController.ts` with `getMapPins` function
- [ ] Add `GET /api/v1/map/pins` endpoint
- [ ] Accept viewport parameters: north, south, east, west (required)
- [ ] Query spots and want-to-go items within viewport
- [ ] Use PostGIS or simple lat/lng filtering
- [ ] Return pins with: place_id, latitude, longitude, pin_type, spot_count
- [ ] Include user's own spots and want-to-go
- [ ] Include network spots (from followed users)
- [ ] Write unit tests

**Task 6.2: Implement Pin Clustering Algorithm**
- [ ] Add clustering logic to `getMapPins` function
- [ ] Accept `zoom` query parameter
- [ ] Implement simple grid-based clustering for low zoom levels
- [ ] Return clusters with: center lat/lng, count of pins
- [ ] Return individual pins for high zoom levels
- [ ] Optimize query performance with spatial indexes
- [ ] Write unit tests

**Task 6.3: Implement Place Summary Card Data Endpoint**
- [ ] Add `GET /api/v1/places/:placeId/summary` endpoint
- [ ] Return: place name, primary category, count of network spots
- [ ] Calculate average rating from network spots
- [ ] Return common tags from network spots
- [ ] Optimize with database aggregations
- [ ] Write unit tests

**Task 6.4: Set Up Mapbox Integration (Backend)**
- [ ] Create `src/config/mapbox.ts` with Mapbox access token
- [ ] Create abstraction for map-related utilities (if needed)
- [ ] Document Mapbox API usage for mobile clients
- [ ] Set up rate limiting for map-related endpoints

**Task 6.5: Optimize Map Performance**
- [ ] Add database indexes for geospatial queries (PostGIS GIST index)
- [ ] Implement viewport-based caching (5-minute TTL) in Redis
- [ ] Cache key: `map_pins:{north}:{south}:{east}:{west}`
- [ ] Optimize database queries with EXPLAIN ANALYZE
- [ ] Add query result pagination if needed
- [ ] Monitor API response times

**Milestone:** Backend provides map pins API, clustering, and summary data; ready for mobile map integration

**Reference:** BRD Section 4.2, PRD Feature 2, API Section 5.4

---

#### **Phase 7: Onboarding & Creator Features**

**Prerequisites:** Phase 6 complete

**Task 7.1: Implement Launch Creators Endpoint**
- [ ] Create `GET /api/v1/onboarding/creators` endpoint
- [ ] Query users where role = 'creator' and is_verified = true
- [ ] Return creator profiles with playlist_count
- [ ] Order by some criteria (e.g., playlist count, creation date)
- [ ] Limit to featured creators (add `is_featured` flag if needed)
- [ ] Write unit tests

**Task 7.2: Implement Onboarding Completion Endpoint**
- [ ] Add `POST /api/v1/onboarding/complete` endpoint
- [ ] Accept `followed_creator_ids` array in request body
- [ ] Create follow relationships for each creator (status: "active")
- [ ] Mark user's onboarding as complete (add `onboarding_completed_at` to users table)
- [ ] Return success response
- [ ] Write unit tests

**Task 7.3: Implement Creator Role Assignment (Admin Tool)**
- [ ] Create admin authentication middleware (or use environment variable check)
- [ ] Add `POST /api/v1/admin/users/:userId/make-creator` endpoint
- [ ] Update user: set role = 'creator', is_verified = true
- [ ] Enforce public profile for creators (set is_private = false)
- [ ] Add audit logging for role changes
- [ ] Write unit tests

**Task 7.4: Add Creator Verification Badge Logic**
- [ ] Update user profile responses to include `is_verified` flag
- [ ] Display verification badge in API responses for creators
- [ ] Update user search to highlight creators
- [ ] Write tests

**Task 7.5: Enforce Public Profile for Creators**
- [ ] Add database constraint: creators must have is_private = false
- [ ] Update user update endpoint to prevent creators from setting is_private = true
- [ ] Add validation in user service
- [ ] Write tests

**Milestone:** Onboarding flow complete, creators can be assigned and verified, new users can follow launch creators

**Reference:** BRD Section 4.2 (User Flow 5.1), BRD Section 3 (Creator Role), API Section 5.10

---

#### **Phase 8: Mobile App Development (iOS)**

**Prerequisites:** Backend APIs from Phases 1-7 available

**Task 8.1: Initialize iOS Project**
- [ ] Create Xcode project with SwiftUI
- [ ] Set up project structure: `Views/`, `Models/`, `Services/`, `Utilities/`
- [ ] Configure Info.plist with required permissions (location, camera, photo library)
- [ ] Set up app icons and launch screen
- [ ] Configure bundle identifier and signing

**Task 8.2: Set Up Networking Layer**
- [ ] Create `Services/APIClient.swift` with URLSession wrapper
- [ ] Implement base URL configuration
- [ ] Add JWT token storage in Keychain
- [ ] Implement token refresh logic
- [ ] Add request/response interceptors for authentication
- [ ] Create error handling utilities

**Task 8.3: Implement Authentication Screens**
- [ ] Create `Views/Auth/SplashView.swift` (logo, sign up/login buttons)
- [ ] Create `Views/Auth/LoginView.swift` (email, password fields)
- [ ] Create `Views/Auth/RegisterView.swift` (email, password, username)
- [ ] Implement navigation between auth screens
- [ ] Connect to backend auth endpoints (`POST /api/v1/auth/register` and `POST /api/v1/auth/login`)
- [ ] Store tokens in Keychain on successful login
- [ ] Navigate to main app on successful authentication
- [ ] **Note:** OAuth integration (Google/Apple Sign-In) is moved to v1.1

**Task 8.4: Implement Main Tab Navigation**
- [ ] Create `Views/MainTabView.swift` with tab bar
- [ ] Add tabs: Map, Feed, Discover, Profile
- [ ] Create placeholder views for each tab
- [ ] Implement tab navigation state management

**Task 8.5: Implement Map Screen with Mapbox**
- [ ] Install Mapbox SDK via SPM
- [ ] Create `Views/Map/MapView.swift` using MapboxMap
- [ ] Configure custom map style
- [ ] Implement map viewport tracking
- [ ] Call `/api/v1/map/pins` endpoint with viewport bounds
- [ ] Render pins on map with custom icons (spot, want-to-go, network)
- [ ] Implement pin clustering for low zoom levels
- [ ] Handle map pan/zoom events to reload pins

**Task 8.6: Implement Place Detail View**
- [ ] Create `Views/Place/PlaceDetailView.swift`
- [ ] Call `/api/v1/places/:placeId` endpoint
- [ ] Display place name, category, network stats
- [ ] Show user's spot or want-to-go if exists
- [ ] Display list of network spots
- [ ] Add "Save" button with options: "Want to Go" or "Save as Spot"
- [ ] Navigate to spot creation flow

**Task 8.7: Implement Spot Creation Flow**
- [ ] Create `Views/Spot/CreateSpotView.swift`
- [ ] Call `GET /api/v1/places/:placeId/questions` endpoint (or include questions in place detail response) to fetch guided questions for the place
- [ ] Parse question response: includes default questions + category-specific questions
- [ ] Display guided questions dynamically based on question type:
  - Text questions: TextField with placeholder
  - Select questions: Picker with options
  - Multiselect questions: Toggle buttons or checkboxes
- [ ] Order questions by `displayOrder` from API response
- [ ] Mark required questions visually (with asterisk or label)
- [ ] Add rating picker (1-5 stars) - required field
- [ ] Add tags input field (comma-separated or chip-based)
- [ ] Add notes text editor (free-form text area)
- [ ] Add photo picker and image upload (max 5 photos)
- [ ] Collect all guided question answers into dictionary: `[questionId: answer]`
- [ ] Validate required questions before submission
- [ ] Call `POST /api/v1/spots` endpoint with:
  - place_id, rating, notes, tags, photos, guided_questions (object)
- [ ] Handle success/error states
- [ ] Show loading state during submission
- [ ] Navigate back to place detail on success

**Task 8.8: Implement Want to Go Flow**
- [ ] Update place detail "Save" button to show options
- [ ] Create `Views/WantToGo/SaveWantToGoView.swift` (optional note input)
- [ ] Call `POST /api/v1/want-to-go` endpoint
- [ ] Update map to show want-to-go pin
- [ ] Implement convert want-to-go to spot flow

**Task 8.9: Implement Feed Screen**
- [ ] Create `Views/Feed/FeedView.swift` with List/ScrollView
- [ ] Call `GET /api/v1/feed` endpoint
- [ ] Implement pull-to-refresh
- [ ] Implement infinite scroll (cursor pagination)
- [ ] Create `Views/Feed/FeedItemView.swift` for playlist items
- [ ] Create `Views/Feed/SpotItemView.swift` for spot items
- [ ] Display author info, content preview, images
- [ ] Handle tap to navigate to playlist/spot detail

**Task 8.10: Implement Profile Screens**
- [ ] Create `Views/Profile/ProfileView.swift` (current user's profile)
- [ ] Create `Views/Profile/OtherUserProfileView.swift` (other users)
- [ ] Display user info, bio, profile picture
- [ ] Show list of published playlists
- [ ] Add "Edit Profile" button (for own profile)
- [ ] Add "Follow" button (for other users)
- [ ] Call `GET /api/v1/users/:userId` endpoint
- [ ] Handle private profile visibility

**Task 8.11: Implement Playlist Creation Flow**
- [ ] Create `Views/Playlist/CreatePlaylistView.swift`
- [ ] Add title, description, cover image picker
- [ ] Create `Views/Playlist/AddSpotsView.swift` (select from user's spots)
- [ ] Call `POST /api/v1/playlists` endpoint
- [ ] Handle publish action
- [ ] Navigate to playlist detail on success

**Task 8.12: Implement Search/Discover Screen**
- [ ] Create `Views/Search/SearchView.swift` with search bar
- [ ] Implement user search: call `GET /api/v1/users/search`
- [ ] Implement place search: call `GET /api/v1/places/search`
- [ ] Display search results in list
- [ ] Handle tap to navigate to user profile or place detail

**Task 8.13: Implement Onboarding Flow**
- [ ] Create `Views/Onboarding/OnboardingView.swift`
- [ ] Call `GET /api/v1/onboarding/creators` to fetch launch creators
- [ ] Display creator cards with follow button
- [ ] Require following at least 3 creators
- [ ] Call `POST /api/v1/onboarding/complete` on completion
- [ ] Navigate to main app (map screen)

**Task 8.14: Implement Offline Support**
- [ ] Set up Core Data stack
- [ ] Create Core Data model for: User, Spot, Playlist, Place (cached)
- [ ] Implement local storage for user's spots and want-to-go
- [ ] Sync local data with backend on app launch
- [ ] Show cached data when offline
- [ ] Handle sync conflicts

**Milestone:** Feature-complete iOS app with all MVP functionality

**Reference:** BRD Section 6 (Platform: iOS), PRD Features 1-4

---

#### **Phase 9: Mobile App Development (Android)**

**Prerequisites:** Backend APIs from Phases 1-7 available, iOS app as reference

**Task 9.1: Initialize Android Project**
- [ ] Create Android Studio project with Kotlin
- [ ] Set up project structure: `ui/`, `data/`, `domain/`, `di/`
- [ ] Configure `AndroidManifest.xml` with permissions
- [ ] Set up app icons and splash screen
- [ ] Configure package name and signing

**Task 9.2: Set Up Networking Layer**
- [ ] Add Retrofit and OkHttp dependencies
- [ ] Create `data/network/ApiService.kt` interface with endpoints
- [ ] Create `data/network/ApiClient.kt` with Retrofit setup
- [ ] Implement JWT token storage in EncryptedSharedPreferences
- [ ] Add OkHttp interceptor for token injection
- [ ] Implement token refresh interceptor
- [ ] Create error handling utilities

**Task 9.3: Implement Authentication Screens**
- [ ] Create `ui/auth/SplashScreen.kt` (Jetpack Compose)
- [ ] Create `ui/auth/LoginScreen.kt`
- [ ] Create `ui/auth/RegisterScreen.kt`
- [ ] Implement navigation using Navigation Compose
- [ ] Connect to backend auth endpoints (`POST /api/v1/auth/register` and `POST /api/v1/auth/login`)
- [ ] Store tokens on successful login
- [ ] Navigate to main app
- [ ] **Note:** OAuth integration (Google Sign-In) is moved to v1.1

**Task 9.4: Implement Main Navigation**
- [ ] Create `ui/navigation/MainNavigation.kt`
- [ ] Set up bottom navigation bar with tabs: Map, Feed, Discover, Profile
- [ ] Create placeholder screens for each tab
- [ ] Implement navigation state management

**Task 9.5: Implement Map Screen with Mapbox**
- [ ] Add Mapbox SDK dependency
- [ ] Create `ui/map/MapScreen.kt` using MapboxMap
- [ ] Configure custom map style
- [ ] Implement viewport tracking
- [ ] Call `/api/v1/map/pins` endpoint
- [ ] Render pins with custom icons
- [ ] Implement pin clustering
- [ ] Handle map movement events

**Task 9.6: Implement Place Detail Screen**
- [ ] Create `ui/place/PlaceDetailScreen.kt`
- [ ] Call `/api/v1/places/:placeId` endpoint
- [ ] Display place information and network spots
- [ ] Add "Save" button with options
- [ ] Navigate to spot creation

**Task 9.7: Implement Spot Creation Flow**
- [ ] Create `ui/spot/CreateSpotScreen.kt` (Jetpack Compose)
- [ ] Call `GET /api/v1/places/:placeId/questions` endpoint (or include questions in place detail response) to fetch guided questions for the place
- [ ] Parse question response: includes default questions + category-specific questions
- [ ] Display guided questions dynamically based on question type:
  - Text questions: TextField with placeholder
  - Select questions: DropdownMenu or RadioButton group
  - Multiselect questions: Checkbox group or chips
- [ ] Order questions by `displayOrder` from API response
- [ ] Mark required questions visually (with asterisk or label)
- [ ] Add rating input (1-5 stars) - required field
- [ ] Add tags input (comma-separated or chip-based)
- [ ] Add notes text input (free-form TextField)
- [ ] Add image picker and upload (max 5 photos)
- [ ] Collect all guided question answers into map: `Map<questionId, answer>`
- [ ] Validate required questions before submission
- [ ] Call `POST /api/v1/spots` endpoint with:
  - place_id, rating, notes, tags, photos, guided_questions (object)
- [ ] Handle success/error states
- [ ] Show loading state during submission
- [ ] Navigate back to place detail on success

**Task 9.8: Implement Want to Go Flow**
- [ ] Create `ui/wanttogo/SaveWantToGoScreen.kt`
- [ ] Add optional note input
- [ ] Call `POST /api/v1/want-to-go` endpoint
- [ ] Update map display

**Task 9.9: Implement Feed Screen**
- [ ] Create `ui/feed/FeedScreen.kt` with LazyColumn
- [ ] Call `GET /api/v1/feed` endpoint
- [ ] Implement pull-to-refresh
- [ ] Implement pagination
- [ ] Create feed item composables
- [ ] Handle navigation

**Task 9.10: Implement Profile Screens**
- [ ] Create `ui/profile/ProfileScreen.kt`
- [ ] Create `ui/profile/OtherUserProfileScreen.kt`
- [ ] Display user info and playlists
- [ ] Add follow/edit buttons
- [ ] Call user endpoints

**Task 9.11: Implement Playlist Creation**
- [ ] Create `ui/playlist/CreatePlaylistScreen.kt`
- [ ] Add title, description, cover image
- [ ] Create spot selection screen
- [ ] Call playlist endpoints

**Task 9.12: Implement Search Screen**
- [ ] Create `ui/search/SearchScreen.kt`
- [ ] Implement user and place search
- [ ] Display results
- [ ] Handle navigation

**Task 9.13: Implement Onboarding Flow**
- [ ] Create `ui/onboarding/OnboardingScreen.kt`
- [ ] Fetch and display launch creators
- [ ] Require following 3+ creators
- [ ] Complete onboarding

**Task 9.14: Implement Offline Support**
- [ ] Set up Room database
- [ ] Create entities: User, Spot, Playlist, Place
- [ ] Create DAOs for local storage
- [ ] Implement sync logic
- [ ] Show cached data offline

**Milestone:** Feature-complete Android app with all MVP functionality

**Reference:** BRD Section 6 (Platform: Android)

---

#### **Phase 10: Testing & Quality Assurance**

**Prerequisites:** Phases 1-9 complete

**Task 10.1: Backend Unit Tests**
- [ ] Achieve >80% code coverage for backend services
- [ ] Write unit tests for all service functions
- [ ] Mock external dependencies (Foursquare, S3, Redis)
- [ ] Test error cases and edge cases
- [ ] Set up coverage reporting (Istanbul/NYC)

**Task 10.2: Backend Integration Tests**
- [ ] Write integration tests for all API endpoints
- [ ] Use test database (separate from dev)
- [ ] Test authentication flows
- [ ] Test CRUD operations
- [ ] Test business logic (follow requests, privacy, etc.)
- [ ] Set up test fixtures and factories

**Task 10.3: Mobile App Unit Tests**
- [ ] Write unit tests for ViewModels/Presenters
- [ ] Write unit tests for service/network layers
- [ ] Mock API responses
- [ ] Test business logic in isolation
- [ ] Achieve >70% coverage for mobile apps

**Task 10.4: End-to-End Tests**
- [ ] Set up E2E testing framework (Detox for React Native, or Appium)
- [ ] Write E2E tests for critical flows:
  - User registration and login
  - Creating a spot
  - Creating and publishing a playlist
  - Following a user
  - Viewing feed
  - Onboarding flow
- [ ] Run E2E tests on CI/CD pipeline

**Task 10.5: Performance Testing**
- [ ] Set up load testing tool (k6, Artillery, or Locust)
- [ ] Create load test scenarios for critical endpoints
- [ ] Test with 100, 500, 1000 concurrent users
- [ ] Measure API response times (target: <400ms P95)
- [ ] Test database performance under load
- [ ] Identify and fix bottlenecks

**Task 10.6: Security Audit**
- [ ] Run dependency vulnerability scan (npm audit, Snyk)
- [ ] Review authentication and authorization logic
- [ ] Test for common vulnerabilities (OWASP Top 10)
- [ ] Review input validation and sanitization
- [ ] Test SQL injection prevention
- [ ] Test XSS prevention
- [ ] Review error messages (no sensitive data leakage)

**Task 10.7: Accessibility Audit**
- [ ] Test iOS app with VoiceOver
- [ ] Test Android app with TalkBack
- [ ] Verify touch target sizes (minimum 44x44 points)
- [ ] Test dynamic font sizing
- [ ] Verify color contrast ratios (WCAG 2.1 AA)
- [ ] Test keyboard navigation
- [ ] Fix accessibility issues

**Task 10.8: Bug Fixes and Refinements**
- [ ] Create bug tracking system (GitHub Issues, Jira)
- [ ] Prioritize bugs by severity
- [ ] Fix critical and high-priority bugs
- [ ] Address user feedback from beta testing
- [ ] Polish UI/UX based on testing

**Milestone:** Production-ready application with comprehensive test coverage, security hardened, accessible

**Reference:** PRD Section 5 (Accessibility, Performance)

---

#### **Phase 11: Launch Preparation**

**Prerequisites:** Phase 10 complete

**Task 11.1: Creator Onboarding**
- [ ] Identify and contact 15-20 potential launch creators
- [ ] Onboard minimum 10 creators (BRD Objective 1)
- [ ] Assign creator role via admin tool
- [ ] Ensure each creator publishes 2+ playlists
- [ ] Verify creator content quality

**Task 11.2: App Store Assets**
- [ ] Create app screenshots for different device sizes
- [ ] Write app description and marketing copy
- [ ] Create app icon (1024x1024)
- [ ] Create promotional graphics
- [ ] Prepare privacy policy URL
- [ ] Prepare support URL

**Task 11.3: iOS App Store Submission**
- [ ] Configure App Store Connect account
- [ ] Create app listing
- [ ] Upload build via Xcode or Transporter
- [ ] Fill out app information, screenshots, description
- [ ] Submit for review
- [ ] Respond to review feedback if needed

**Task 11.4: Google Play Store Submission**
- [ ] Configure Google Play Console account
- [ ] Create app listing
- [ ] Upload AAB (Android App Bundle)
- [ ] Fill out store listing
- [ ] Submit for review
- [ ] Respond to review feedback if needed

**Task 11.5: Production Monitoring Setup**
- [ ] Set up APM tool (DataDog, New Relic, or AWS X-Ray)
- [ ] Configure error tracking (Sentry)
- [ ] Set up log aggregation (CloudWatch, ELK)
- [ ] Create dashboards for key metrics
- [ ] Set up alerts for errors, high latency, downtime
- [ ] Configure uptime monitoring

**Task 11.6: User Documentation**
- [ ] Create user guide/help documentation
- [ ] Write FAQ
- [ ] Create in-app help tooltips
- [ ] Document known issues and workarounds

**Task 11.7: Launch Plan**
- [ ] Create launch communication plan
- [ ] Prepare launch announcement
- [ ] Coordinate with creators for launch day
- [ ] Plan social media posts
- [ ] Set up customer support channels

**Milestone:** Application launched in app stores, creators onboarded, monitoring active

**Reference:** BRD Section 2 (Business Objective 1)

---

### 9.3 Success Criteria by Phase

| Phase | Success Criteria |
|-------|-----------------|
| Phase 1 | Backend server running, users can register/login via API, JWT authentication working |
| Phase 2 | Users can create/update profiles, upload profile pictures, and search for places |
| Phase 3 | Users can create spots with ratings/notes/photos, save places as "Want to Go" with notes, convert want-to-go to spots |
| Phase 4 | Users can create, edit, publish, and delete playlists; add/remove spots; view playlist details |
| Phase 5 | Users can search and follow others, manage follow requests, see chronological feed, and control profile privacy |
| Phase 6 | Backend provides map pins API, clustering, and summary data; ready for mobile map integration |
| Phase 7 | Onboarding flow complete, creators can be assigned and verified, new users can follow launch creators |
| Phase 8 | Feature-complete iOS app with all MVP functionality |
| Phase 9 | Feature-complete Android app with all MVP functionality |
| Phase 10 | Production-ready application with comprehensive test coverage, security hardened, accessible |
| Phase 11 | Application launched in app stores, creators onboarded, monitoring active |

### 9.4 Risk Mitigation in Development

- **Parallel Development:** Backend (Phases 1-7) and mobile (Phases 8-9) can work in parallel once API contracts are defined
- **Early Integration:** Integrate mobile apps with backend as soon as Phase 2 APIs are ready (can start Phase 8.2-8.3 while backend continues)
- **Incremental Testing:** Test each task before moving to next; write unit tests as you build
- **Creator Onboarding:** Start creator outreach during Phase 7 to ensure content ready for Phase 11 launch
- **Task Dependencies:** Always check prerequisites before starting a phase; complete all tasks in a phase before moving to next

---

## 10. Risk Assessment and Mitigation Strategies

### 10.1 Technical Risks

#### **Risk 1: Third-Party API Dependencies**

**Description:** Project Echo depends heavily on external services (Mapbox, Foursquare) for core functionality. Service outages, API changes, or cost increases could impact the product.

**Probability:** Medium  
**Impact:** High

**Mitigation Strategies:**
- **Abstraction Layer:** Create abstraction layer for place data service, allowing easy switch between providers
- **Caching:** Aggressive caching (30 days) to reduce dependency on external APIs
- **Fallback Plans:** Identify alternative providers (Google Places API as backup)
- **Monitoring:** Set up alerts for external API failures
- **Cost Monitoring:** Track API usage and costs, set up budget alerts
- **Contract Review:** Review SLA terms with providers, negotiate if possible

**Reference:** BRD Section 6 (Dependency on third-party services)

---

#### **Risk 2: Performance at Scale**

**Description:** Map performance with hundreds of pins, feed generation for large follower networks, and database query performance may degrade as user base grows.

**Probability:** Medium  
**Impact:** High

**Mitigation Strategies:**
- **Early Optimization:** Implement pin clustering, viewport-based loading from Phase 6
- **Load Testing:** Conduct load testing at each phase, especially before launch
- **Database Optimization:** Index strategy defined in Phase 1, monitor slow queries
- **Caching Strategy:** Implement Redis caching from Phase 2
- **Horizontal Scaling Plan:** Design stateless architecture to enable horizontal scaling
- **Performance Budgets:** Set performance budgets (e.g., API < 400ms) and monitor continuously

**Reference:** BRD Section 6 (Performance requirements), PRD Section 5 (Scalability: 10,000 concurrent users)

---

#### **Risk 3: Data Migration and Schema Changes**

**Description:** As product evolves, database schema changes may be needed. Migrating production data without downtime is challenging.

**Probability:** Medium  
**Impact:** Medium

**Mitigation Strategies:**
- **Migration Strategy:** Use database migration tools (e.g., Prisma Migrate, Alembic)
- **Backward Compatibility:** Maintain API versioning, support multiple API versions during transitions
- **Zero-Downtime Deployments:** Use blue-green deployments or rolling updates
- **Data Backup:** Regular automated backups, test restore procedures
- **Staging Environment:** Test all migrations in staging first

---

#### **Risk 4: Security Vulnerabilities**

**Description:** Security breaches could compromise user data, authentication tokens, or lead to data leaks.

**Probability:** Low  
**Impact:** Critical

**Mitigation Strategies:**
- **Security Best Practices:** Follow OWASP guidelines, use parameterized queries, input validation
- **Regular Audits:** Conduct security audits before launch and quarterly thereafter
- **Dependency Scanning:** Automate vulnerability scanning (Snyk, Dependabot)
- **Penetration Testing:** Engage third-party security firm for pen testing before launch
- **Incident Response Plan:** Document and practice incident response procedures
- **Encryption:** Encrypt data at rest and in transit (TLS 1.3, database encryption)

**Reference:** BRD Section 6 (Security requirements), PRD Section 5 (Security)

---

### 10.2 Business Risks

#### **Risk 5: Creator Onboarding Challenges**

**Description:** Difficulty onboarding 10 launch creators (BRD Objective 1) could delay launch or result in insufficient content for new users.

**Probability:** Medium  
**Impact:** High

**Mitigation Strategies:**
- **Early Outreach:** Begin creator outreach in Phase 7 (6 weeks before launch)
- **Creator Incentives:** Offer early access, featured placement, future monetization preview
- **Content Requirements:** Clear guidelines for creators (minimum 2 playlists, quality standards)
- **Creator Support:** Dedicated support channel for creators during onboarding
- **Backup Plan:** Identify 15-20 potential creators to ensure 10 commit

**Reference:** BRD Section 2 (Business Objective 1: Validate Creator-Led Model)

---

#### **Risk 6: Low User Adoption**

**Description:** Failure to achieve 1,000 MAU in first 3 months (BRD Objective 2) could indicate product-market fit issues.

**Probability:** Medium  
**Impact:** High

**Mitigation Strategies:**
- **MVP Focus:** Strictly limit scope to MVP features, launch quickly to validate
- **User Feedback Loop:** Implement in-app feedback mechanism (BRD Objective 4) from day one
- **Analytics:** Track key metrics (activation rate, retention) from launch
- **Iteration Plan:** Plan for fast iteration based on user feedback
- **Marketing Strategy:** Develop go-to-market strategy parallel to development
- **Referral Program:** Consider referral incentives to drive early adoption

**Reference:** BRD Section 2 (Business Objective 2: Achieve Early User Adoption)

---

#### **Risk 7: App Store Rejection**

**Description:** iOS or Android app store rejection could delay launch significantly.

**Probability:** Low  
**Impact:** High

**Mitigation Strategies:**
- **Guidelines Compliance:** Review Apple HIG and Google Material Design guidelines throughout development
- **Early Submission:** Submit for review 2 weeks before target launch date
- **Beta Testing:** Use TestFlight (iOS) and Internal Testing (Android) to catch issues early
- **Review Process:** Familiarize team with app store review process and common rejection reasons

**Reference:** BRD Section 6 (Usability: Adhere to platform guidelines)

---

### 10.3 Operational Risks

#### **Risk 8: Infrastructure Costs**

**Description:** Cloud infrastructure costs (AWS, external APIs) could exceed budget, especially with unexpected traffic spikes.

**Probability:** Medium  
**Impact:** Medium

**Mitigation Strategies:**
- **Cost Monitoring:** Set up AWS Cost Explorer, budget alerts
- **Optimization:** Implement caching, CDN, image optimization to reduce costs
- **Auto-Scaling:** Configure auto-scaling with conservative thresholds
- **Cost Estimates:** Create detailed cost estimates for 1K, 10K, 100K users
- **Reserved Instances:** Consider reserved instances for predictable workloads (database)

---

#### **Risk 9: Team Capacity and Timeline**

**Description:** Development timeline may slip due to scope creep, technical challenges, or resource constraints.

**Probability:** Medium  
**Impact:** Medium

**Mitigation Strategies:**
- **Scope Management:** Strictly enforce MVP scope (BRD Section 3), defer features to v1.1
- **Agile Methodology:** 2-week sprints with regular retrospectives to identify blockers early
- **Buffer Time:** Include 2-week buffer in Phase 9-10 for unexpected issues
- **Prioritization:** Use MoSCoW method (Must have, Should have, Could have, Won't have)
- **Regular Reviews:** Weekly progress reviews, adjust timeline if needed

**Reference:** BRD Section 3 (Scope for Version 1.0 MVP)

---

#### **Risk 10: Data Quality and Place Data Accuracy**

**Description:** Inaccurate or outdated place data from external provider could lead to poor user experience.

**Probability:** Low  
**Impact:** Medium

**Mitigation Strategies:**
- **Provider Selection:** Choose reputable provider (Foursquare has high data quality)
- **User Reporting:** Allow users to report incorrect place data
- **Data Validation:** Validate place data before storing (coordinates, name format)
- **Update Mechanism:** Periodic sync to update place data (if provider supports)
- **Fallback:** Manual correction process for critical places

**Reference:** BRD Section 6 (Place Data Service Requirements)

---

### 10.4 Risk Matrix Summary

| Risk | Probability | Impact | Priority | Mitigation Status |
|------|------------|--------|----------|-------------------|
| Third-Party API Dependencies | Medium | High | P1 | Planned |
| Performance at Scale | Medium | High | P1 | Planned |
| Creator Onboarding | Medium | High | P1 | Planned |
| Low User Adoption | Medium | High | P1 | Planned |
| Security Vulnerabilities | Low | Critical | P1 | Planned |
| App Store Rejection | Low | High | P2 | Planned |
| Infrastructure Costs | Medium | Medium | P2 | Planned |
| Team Capacity/Timeline | Medium | Medium | P2 | Planned |
| Data Migration Issues | Medium | Medium | P2 | Planned |
| Data Quality | Low | Medium | P3 | Planned |

### 10.5 Continuous Risk Management

- **Weekly Risk Review:** Review and update risk register weekly during development
- **Post-Launch Monitoring:** Continue risk assessment post-launch, new risks may emerge
- **Stakeholder Communication:** Communicate high-priority risks to stakeholders regularly
- **Contingency Plans:** Maintain contingency plans for critical risks (P1)

---

## Appendix A: Key Decisions and Rationale

### A.1 Native vs. Cross-Platform

**Decision:** Native iOS and Android development (Swift/SwiftUI and Kotlin/Jetpack Compose)

**Rationale:**
- Best performance for map rendering (BRD Section 6 requirement)
- Full access to platform features (Apple Sign-In, Google Sign-In)
- Adherence to platform guidelines (BRD Section 6)
- Better user experience and app store ratings (BRD Objective 3)

### A.2 Database Choice: PostgreSQL

**Decision:** PostgreSQL over NoSQL (MongoDB) or other SQL databases

**Rationale:**
- ACID compliance for user data integrity
- Strong support for JSON columns (flexible data like tags, guided questions)
- Full-text search capabilities
- Geospatial support (PostGIS) for location queries
- Mature ecosystem and tooling

### A.3 Map Provider: Mapbox

**Decision:** Mapbox over Google Maps

**Rationale:**
- Extensive brand customization (BRD Section 6 requirement)
- Competitive pricing for startup volumes
- Good mobile SDK support
- High performance and smooth rendering

---

## Appendix B: References

- **BRD:** Business Requirements Document - Project Echo v1.0
- **PRD:** Product Requirements Document - Project Echo v1.0
- **Apple Human Interface Guidelines:** https://developer.apple.com/design/human-interface-guidelines/
- **Google Material Design:** https://material.io/design
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024 | Engineering Team | Initial version based on BRD and PRD |

---

**End of Technical Design Document**

