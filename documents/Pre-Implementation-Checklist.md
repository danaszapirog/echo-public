# Pre-Implementation Checklist

## Project Echo: Pre-Development Setup

Before starting implementation, complete these items to ensure a smooth development process.

---

## 🔴 Critical: Must Complete Before Phase 1

### 1. External Service Accounts & API Keys

#### Mapbox (Map Visualization)
- [x] Create Mapbox account at https://www.mapbox.com
- [x] Generate access token
- [x] Review pricing plan (start with free tier, upgrade as needed)
- [x] Document token in secure location (configured in `.env`)
- [x] Test API access (ready for Phase 6 - Map features) - ✅ **VERIFIED: Token working, all APIs accessible**

#### Foursquare Places API (Place Data)
- [x] Create Foursquare developer account at https://developer.foursquare.com
- [x] Create new app/project
- [x] Obtain API key (Places API v3 uses service key, not OAuth)
- [x] Review API documentation and rate limits
- [x] Test API access with sample queries (verified working)
- [x] Document credentials securely (configured in `.env`)
- [x] Migrated to new Places API format (places-api.foursquare.com)

#### AWS (Infrastructure & Media Storage) - Using CDK
- [x] Create AWS account
- [x] Install AWS CLI (`brew install awscli` or download from aws.amazon.com/cli)
- [x] Configure AWS CLI (`aws configure` with your AWS credentials)
- [x] Install CDK CLI (`npm install -g aws-cdk`)
- [x] Deploy infrastructure using CDK (user confirmed deployment)
- [x] Create IAM access keys for `echo-backend-dev` user (AWS Console → IAM → Users)
- [x] Get S3 bucket name from CDK outputs (`echo-media-dev`)
- [x] Get CloudFront domain from CDK outputs (optional, configured)
- [x] Document credentials securely (configured in `.env` file)
- [x] Set up billing alerts in AWS Console (recommended) - ✅ **COMPLETE**

**Note:** For MVP (v1.0), authentication will be email/password only. Google and Apple Sign-In are moved to v1.1 to simplify MVP dependencies.

---

### 2. Environment Configuration

#### Backend Environment Variables
Create a comprehensive `.env.example` file with all required variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/echo_dev
DATABASE_TEST_URL=postgresql://user:password@localhost:5432/echo_test

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-here
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=echo-media

# Mapbox
MAPBOX_ACCESS_TOKEN=your-mapbox-token

# Foursquare
FOURSQUARE_API_KEY=your-api-key
FOURSQUARE_API_SECRET=your-api-secret

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OAuth - Apple
APPLE_CLIENT_ID=your-apple-client-id
APPLE_TEAM_ID=your-team-id
APPLE_KEY_ID=your-key-id
APPLE_PRIVATE_KEY=your-private-key

# App
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000

# Security
BCRYPT_SALT_ROUNDS=12
```

- [x] Document all required environment variables (`.env.example` created)
- [ ] Set up secure storage for production secrets (AWS Secrets Manager, etc.) - **TODO: Before production**
- [x] Create `.env.example` file (without actual secrets)
- [x] Add `.env` to `.gitignore` (verified in security audit)

---

### 3. Design & UX Assets

#### Missing Design Specifications
The PRD mentions wireframes but no actual design files are provided. Before mobile development (Phase 8-9):

- [ ] **Design System:**
  - [ ] Color palette (primary, secondary, accent colors)
  - [ ] Typography (font families, sizes, weights)
  - [ ] Spacing system (margins, padding)
  - [ ] Icon set (custom icons for spots, want-to-go, etc.)
  - [ ] Component library (buttons, cards, inputs)

- [ ] **Screen Designs:**
  - [ ] Splash screen
  - [ ] Authentication screens (login, register)
  - [ ] Onboarding flow
  - [ ] Map screen with pins
  - [ ] Place detail screen
  - [ ] Spot creation screen
  - [ ] Playlist screens
  - [ ] Profile screens
  - [ ] Feed screen
  - [ ] Search screen

- [ ] **Assets:**
  - [ ] App icon (1024x1024 for iOS, various sizes for Android)
  - [ ] Launch screen assets
  - [ ] Custom map pin icons (spot, want-to-go, network)
  - [ ] Custom map style (Mapbox Studio)

**Note:** For MVP, you can start with basic designs and iterate. However, having at least a design system and key screen mockups will speed up development.

---

### 4. Content & Data Requirements

#### Guided Questions Templates
The BRD/PRD mention guided questions but don't specify the complete list. Define:

- [x] **Default Questions (for all categories):**
  - [x] "What's the vibe?" (text)
  - [x] "Best time to visit?" (text)
  - [x] "How crowded does it get?" (select)
  - [x] "Any general tips?" (text)
  - [x] 4 default questions implemented

- [x] **Category-Specific Questions:**
  - [x] **Restaurants:** "What's the one dish to order?", "Price range?", "Dietary options?", "Service speed?", "Reservation needed?"
  - [x] **Fitness:** "Workout type?", "Equipment quality?", "Membership required?", "Amenities?", "Atmosphere?"
  - [x] **Beauty:** "Service type?", "Price range?"
  - [x] **Bars & Clubs:** "What's the one drink to order?", "Music type?", "Crowd type?", "Cover charge?", "Dress code?", "Food available?"
  - [x] **Culture Attractions:** "What's the one thing to see?", "Visit duration?", "Ticket price?", "Reservation needed?"
  - [x] **Nature:** "Difficulty level?", "Visit duration?", "Entrance fee?", "Parking?", "Amenities?", "Best season?", "Photo spot?", "What to bring?"
  - [x] 39 category-specific questions implemented across 6 categories

- [x] **Question Format:**
  - [x] Define question types (text, select, multiselect)
  - [x] Define which questions are required vs optional (all optional for MVP)
  - [x] Create seed data file for database (`prisma/seed-guided-questions.ts`)
  - [x] Database seeded with 43 total questions

**Status:** ✅ **COMPLETE** - Guided questions system fully implemented in Phase 3

---

### 5. Legal & Compliance

#### Privacy & Terms
- [ ] **Privacy Policy:**
  - [ ] Draft privacy policy covering:
    - Data collection (location, profile, content)
    - Data usage
    - Third-party services (Mapbox, Foursquare)
    - User rights (GDPR compliance)
    - Data retention
  - [ ] Host privacy policy at a public URL
  - [ ] Link in app and during registration

- [ ] **Terms of Service:**
  - [ ] Draft terms of service
  - [ ] Cover user-generated content rights
  - [ ] Cover acceptable use policy
  - [ ] Host at public URL

- [ ] **GDPR Compliance:**
  - [ ] Document data processing activities
  - [ ] Implement user data export functionality (for Phase 2+)
  - [ ] Implement user data deletion functionality
  - [ ] Add consent mechanisms where required

- [ ] **App Store Requirements:**
  - [ ] Review Apple App Store Review Guidelines
  - [ ] Review Google Play Developer Policy
  - [ ] Ensure compliance with location data usage policies

---

### 6. Infrastructure Decisions

#### Cloud Provider Setup
- [x] **Choose Primary Cloud Provider:**
  - [x] AWS (recommended in TDD) - **Selected**
  - [ ] Google Cloud Platform (alternative)
  - [ ] Other

- [x] **Set Up Development Environment:**
  - [x] Create development AWS account/project
  - [ ] Set up separate staging environment - **TODO: Before Phase 10**
  - [ ] Set up production environment (can wait until Phase 10)
  - [ ] Configure billing alerts - **TODO: Recommended**

- [x] **Database Setup:**
  - [x] Decide on managed database (AWS RDS) vs self-hosted (local for dev)
  - [x] For development: Set up local PostgreSQL (`echo_dev` database created)
  - [ ] For staging: Set up managed PostgreSQL instance - **TODO: Before Phase 10**
  - [ ] Configure backups - **TODO: Before production**

- [x] **Redis Setup:**
  - [x] For development: Set up local Redis (configured in docker-compose.yml)
  - [ ] For staging: Set up managed Redis (AWS ElastiCache) - **TODO: Before Phase 10**

---

### 7. Development Tools & Setup

#### Version Control
- [x] Initialize Git repository (linked to https://github.com/danaszapirog/echo-public.git)
- [x] Set up `.gitignore` for:
  - [x] Node.js (`node_modules/`, `.env`)
  - [x] iOS (Xcode build files, `*.xcuserstate`)
  - [x] Android (`build/`, `.gradle/`)
  - [x] IDE files (`.vscode/`, `.idea/`)
- [x] Create initial commit with project structure
- [ ] Set up branch protection rules (main/master branch) - **TODO: Configure in GitHub**

#### CI/CD Setup (Can be done in Phase 1, Task 1.8)
- [x] Choose CI/CD platform (GitHub Actions - `.github/workflows/ci.yml` created)
- [x] Configure automated testing pipeline (linting, testing, building)
- [ ] Set up repository secrets for:
  - [ ] Database credentials - **TODO: Add to GitHub Secrets**
  - [ ] API keys - **TODO: Add to GitHub Secrets**
  - [ ] AWS credentials - **TODO: Add to GitHub Secrets**

#### Development Tools
- [x] Install required software:
  - [x] Node.js 20 LTS
  - [x] PostgreSQL 15+ (local setup complete)
  - [x] Redis 7+ (local setup complete)
  - [x] Docker & Docker Compose (for local dev - `docker-compose.yml` created)
  - [ ] Xcode (for iOS development) - **TODO: Before Phase 8**
  - [ ] Android Studio (for Android development) - **TODO: Before Phase 8**
- [x] Set up TypeScript configuration (`tsconfig.json` configured)
- [ ] Set up code formatting (Prettier, ESLint) - **TODO: Recommended**

---

### 8. Business & Product Setup

#### Creator Onboarding Preparation
While this happens in Phase 11, start planning now:

- [ ] **Identify Launch Creators:**
  - [ ] Create list of 15-20 potential creators in NYC
  - [ ] Research their social media presence
  - [ ] Prepare outreach materials
  - [ ] Define creator selection criteria

- [ ] **Creator Content Guidelines:**
  - [ ] Define minimum content requirements (2+ playlists)
  - [ ] Create content quality guidelines
  - [ ] Prepare creator onboarding materials

#### Analytics & Monitoring
- [ ] **Choose Analytics Platform:**
  - [ ] Firebase Analytics (free, easy integration)
  - [ ] Mixpanel (more features, paid)
  - [ ] Amplitude (good free tier)
  - [ ] Custom solution

- [ ] **Set Up Event Tracking Plan:**
  - [ ] Define key events to track (see PRD Section 1 for KPIs)
  - [ ] User registration
  - [ ] Spot creation
  - [ ] Playlist creation
  - [ ] User follows
  - [ ] Map interactions

---

### 9. Technical Decisions & Clarifications

#### Architecture Decisions
- [x] **Finalize Technology Stack:**
  - [x] Confirm Node.js + TypeScript - **Selected**
  - [x] Confirm Express.js - **Selected**
  - [x] Confirm Prisma - **Selected**

- [x] **Database Decisions:**
  - [x] Confirm PostgreSQL version (15+) - **Using PostgreSQL 15**
  - [x] Decide on PostGIS extension (for geospatial queries) - **✅ DECIDED: Using Simple Lat/Lng filtering for MVP (can upgrade to PostGIS later)**
  - [x] Plan database migration strategy (Prisma Migrate)

- [x] **API Design:**
  - [x] Review and finalize API endpoint structure (RESTful, `/api/v1/` prefix)
  - [x] Decide on API versioning strategy (`/api/v1/`)
  - [ ] Plan API documentation tool (Swagger/OpenAPI) - **TODO: Recommended**

#### Missing Specifications
- [x] **Image Processing:**
  - [x] Define image size limits (5MB max, configured in env)
  - [ ] Define thumbnail dimensions (200x200, 800x800 mentioned) - **TODO: Implement in Phase 3.4**
  - [x] Choose image processing service (server-side with Sharp ready, S3 integration complete)

- [ ] **Rate Limiting:**
  - [ ] Define rate limits per endpoint - **TODO: Before production**
  - [ ] Define rate limits per user tier (if any) - **TODO: Before production**

- [x] **Error Handling:**
  - [x] Define standard error response format (CustomError class implemented)
  - [ ] Create error code catalog - **TODO: Recommended**

---

### 10. Documentation

#### Technical Documentation
- [ ] **API Documentation:**
  - [ ] Set up API documentation tool (Swagger/OpenAPI) - **TODO: Recommended**
  - [x] Document all endpoints (endpoints documented in PHASE*_COMPLETE.md files)

- [x] **Development Documentation:**
  - [x] Create `README.md` with setup instructions (`backend/README.md` exists)
  - [x] Document local development setup (Docker Compose setup documented)
  - [ ] Document deployment process - **TODO: Before production**
  - [ ] Create architecture decision records (ADRs) for key decisions - **TODO: Recommended**

#### User Documentation
- [ ] Plan user help documentation (can be done in Phase 11)
- [ ] Plan in-app tooltips and onboarding hints

---

## 🔵 Future Requirements: v1.1 (Post-MVP)

### Google OAuth (Sign-In)
**Purpose:** Simplify user registration and login process (BRD Section 4.1)

**Note:** This is NOT needed for MVP. Set this up when implementing v1.1 social sign-in features.

- [ ] Create Google Cloud Console project
- [ ] Enable Google Sign-In API
- [ ] Create OAuth 2.0 credentials (Web application type for backend)
- [ ] Create OAuth 2.0 credentials (iOS client ID)
- [ ] Create OAuth 2.0 credentials (Android client ID)
- [ ] Configure authorized redirect URIs
- [ ] Document client IDs and secrets securely

### Apple Sign-In (iOS Only)
**Purpose:** Simplify user registration and login process (BRD Section 4.1)

**Note:** This is NOT needed for MVP. Set this up when implementing v1.1 social sign-in features.

- [ ] Enroll in Apple Developer Program ($99/year)
- [ ] Create App ID in Apple Developer Portal
- [ ] Enable "Sign in with Apple" capability
- [ ] Create Service ID for web authentication
- [ ] Configure domains and redirect URLs
- [ ] Generate private key for Sign in with Apple
- [ ] Document credentials securely

### Google Maps Import OAuth Setup
**Purpose:** Enable Google Maps Import feature (BRD Section 3, Out-of-Scope; PRD Section 7, P1)

**Note:** This requires Google OAuth to be set up first (see above). Set this up when implementing v1.1 Google Maps Import feature.

- [ ] Update Google Cloud Console OAuth consent screen to request additional scopes:
  - [ ] Google Maps API scope (for accessing user's saved places)
  - [ ] User profile scope (if not already included)
- [ ] Update OAuth 2.0 credentials to include Google Maps API access
- [ ] Test OAuth flow with expanded scopes
- [ ] Document updated credentials securely
- [ ] **Timeline:** Complete before implementing Phase v1.1 Google Maps Import feature

---

## 🟡 Important: Should Complete Early (Before Phase 3)

### 11. Guided Questions Content
- [x] Finalize all guided question templates (43 questions across 6 categories + defaults)
- [x] Create database seed file (`prisma/seed-guided-questions.ts`)
- [x] Test question flow with sample data (seeded successfully)
- [x] **Status:** ✅ **COMPLETE** - Implemented in Phase 3

### 12. Design Assets (Minimum)
- [ ] At minimum, create:
  - [ ] Color palette
  - [ ] Typography system
  - [ ] Basic component designs (buttons, cards)
  - [ ] Custom map pin icons
- [ ] Can iterate on full screen designs during development

---

## 🟢 Nice to Have: Can Complete During Development

### 13. Advanced Setup
- [ ] Set up error tracking (Sentry)
- [ ] Set up APM (DataDog, New Relic)
- [ ] Set up log aggregation
- [ ] Set up monitoring dashboards

### 14. Testing Infrastructure
- [ ] Set up test database
- [ ] Configure test environment variables
- [ ] Set up E2E testing framework (can wait until Phase 10)

---

## Priority Order

### Before Starting Phase 1:
1. ✅ External service accounts (Mapbox, Foursquare, AWS) - **COMPLETE**
2. ✅ Environment variables documented (email/password auth only for MVP) - **COMPLETE**
3. ✅ Development tools installed (Node.js, PostgreSQL, Redis) - **COMPLETE**
4. ✅ Git repository set up (linked to GitHub) - **COMPLETE**
5. ✅ Basic infrastructure decisions made (AWS, Express, Prisma) - **COMPLETE**

### Before Starting Phase 3 (Content Creation):
6. ✅ Guided questions templates defined (43 questions seeded) - **COMPLETE**
7. ✅ Image processing specifications finalized (5MB limit, S3 integration) - **COMPLETE**

### Current Status (After Phase 5):
- ✅ Phase 1: Foundation & Infrastructure - **COMPLETE**
- ✅ Phase 2: Core User Features - **COMPLETE**
- ✅ Phase 3: Content Creation - Spots & Want to Go - **COMPLETE**
- ✅ Phase 4: Playlists - **COMPLETE**
- ✅ Phase 5: Social Features - Following & Feed - **COMPLETE**
- ✅ Phase 6: Map Integration & Discovery - **COMPLETE** (✅ Geospatial decision: Simple Lat/Lng, ✅ Map pins API, ✅ Clustering, ✅ Place summary, ✅ Rate limiting, ✅ Indexes)
- ✅ Phase 7: Onboarding & Creator Features - **COMPLETE** (✅ Launch creators endpoint, ✅ Onboarding completion, ✅ Creator role assignment, ✅ Verification badges, ✅ Public profile enforcement)

### Before Starting Phase 8 (Mobile Development):
8. ✅ Design system and key screen designs
9. ✅ App icons and assets
10. ✅ Custom map style

### Before Phase 11 (Launch):
11. ✅ Privacy policy and terms of service
12. ✅ Creator outreach started
13. ✅ Analytics platform set up

---

## Quick Start: Minimum Viable Setup

If you want to start immediately, you can begin Phase 1 with just:

1. ✅ Local development environment (Node.js, PostgreSQL, Redis)
2. ✅ ✅ Git repository initialized
3. ✅ Basic `.env.example` file created

You can add API keys and external services as you reach the tasks that need them. However, it's recommended to set up at least Mapbox and Foursquare accounts early since they're needed in Phase 2.

---

## Next Steps

### ✅ Completed Phases
- **Phase 1:** Foundation & Infrastructure - ✅ Complete
- **Phase 2:** Core User Features - ✅ Complete  
- **Phase 3:** Content Creation - Spots & Want to Go - ✅ Complete
- **Phase 4:** Playlists - ✅ Complete
- **Phase 5:** Social Features - Following & Feed - ✅ Complete
- **Phase 6:** Map Integration & Discovery - ✅ Complete
- **Phase 7:** Onboarding & Creator Features - ✅ Complete

### 🎯 Current Status
**Phase 6 Complete: Map Integration & Discovery** ✅
- ✅ Geospatial query decision: Simple Lat/Lng filtering
- ✅ Mapbox token configured and verified (all APIs working)
- ✅ Redis verified and working (Redis 8.2.3, all operations tested)
- ✅ Database indexes created (composite index on latitude/longitude)
- ✅ Caching implemented (5-minute TTL, viewport-based keys)
- ✅ Rate limiting implemented (30 req/min for map endpoints)
- ✅ Map pins API endpoint implemented
- ✅ Pin clustering algorithm implemented
- ✅ Place summary card endpoint implemented
- ✅ **PHASE 7 COMPLETE** - Onboarding and creator features implemented
- ⏭️ **NEXT:** Phase 8 - Mobile App Development (iOS)

### 📋 Remaining Critical Items (Before Production)
1. **Legal & Compliance:**
   - [ ] Privacy Policy
   - [ ] Terms of Service
   - [ ] GDPR compliance documentation

2. **Production Readiness:**
   - [ ] Set up staging environment
   - [ ] Configure production secrets management
   - [ ] Set up monitoring and error tracking
   - [ ] Configure rate limiting
   - [ ] Set up API documentation (Swagger/OpenAPI)

3. **Before Mobile Development (Phase 8):**
   - [ ] Design system and key screen designs
   - [ ] App icons and assets
   - [ ] Custom map style

### 🚀 Immediate Next Steps
1. Continue with **Phase 4: Playlists** implementation
2. Set up GitHub repository secrets for CI/CD
3. Consider adding API documentation tool (Swagger/OpenAPI)

