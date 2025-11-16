# Pre-Implementation Checklist

## Project Echo: Pre-Development Setup

Before starting implementation, complete these items to ensure a smooth development process.

---

## 🔴 Critical: Must Complete Before Phase 1

### 1. External Service Accounts & API Keys

#### Mapbox (Map Visualization)
- [ ] Create Mapbox account at https://www.mapbox.com
- [ ] Generate access token
- [ ] Review pricing plan (start with free tier, upgrade as needed)
- [ ] Document token in secure location (will be added to `.env` later)
- [ ] Test API access

#### Foursquare Places API (Place Data)
- [ ] Create Foursquare developer account at https://developer.foursquare.com
- [ ] Create new app/project
- [ ] Obtain API key and secret
- [ ] Review API documentation and rate limits
- [ ] Test API access with sample queries
- [ ] Document credentials securely

#### AWS (Infrastructure & Media Storage) - Using CDK
- [ ] Create AWS account
- [ ] Install AWS CLI (`brew install awscli` or download from aws.amazon.com/cli)
- [ ] Configure AWS CLI (`aws configure` with your AWS credentials)
- [ ] Install CDK CLI (`npm install -g aws-cdk`)
- [ ] Deploy infrastructure using CDK:
  ```bash
  cd infrastructure
  npm install
  cdk bootstrap  # First time only
  npm run deploy:dev
  ```
- [ ] Create IAM access keys for `echo-backend-dev` user (AWS Console → IAM → Users)
- [ ] Get S3 bucket name from CDK outputs (`echo-media-dev`)
- [ ] Get CloudFront domain from CDK outputs
- [ ] Document credentials securely (add to `.env` file)
- [ ] Set up billing alerts in AWS Console

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

- [ ] Document all required environment variables
- [ ] Set up secure storage for production secrets (AWS Secrets Manager, etc.)
- [ ] Create `.env.example` file (without actual secrets)
- [ ] Add `.env` to `.gitignore`

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

- [ ] **Default Questions (for all categories):**
  - [ ] "What's the vibe?" (text)
  - [ ] "What's the one thing to order/try?" (text)
  - [ ] "Best time to visit?" (text or time)
  - [ ] Add more as needed

- [ ] **Category-Specific Questions:**
  - [ ] **Restaurants:** "What's the one dish to order?", "Price range?", "Dietary options?"
  - [ ] **Cafes:** "Best drink?", "WiFi quality?", "Good for working?"
  - [ ] **Bars:** "Best drink?", "Crowd vibe?", "Music type?"
  - [ ] **Attractions:** "Best time to visit?", "Crowd level?", "Photo spots?"
  - [ ] Add more categories as needed

- [ ] **Question Format:**
  - [ ] Define question types (text, multiple choice, rating, etc.)
  - [ ] Define which questions are required vs optional
  - [ ] Create seed data file for database

**Action:** Create `backend/src/data/guidedQuestions.json` or seed file with question templates.

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
- [ ] **Choose Primary Cloud Provider:**
  - [ ] AWS (recommended in TDD)
  - [ ] Google Cloud Platform (alternative)
  - [ ] Other

- [ ] **Set Up Development Environment:**
  - [ ] Create development AWS account/project
  - [ ] Set up separate staging environment
  - [ ] Set up production environment (can wait until Phase 10)
  - [ ] Configure billing alerts

- [ ] **Database Setup:**
  - [ ] Decide on managed database (AWS RDS) vs self-hosted
  - [ ] For development: Set up local PostgreSQL
  - [ ] For staging: Set up managed PostgreSQL instance
  - [ ] Configure backups

- [ ] **Redis Setup:**
  - [ ] For development: Set up local Redis
  - [ ] For staging: Set up managed Redis (AWS ElastiCache)

---

### 7. Development Tools & Setup

#### Version Control
- [ ] Initialize Git repository (if not already done)
- [ ] Set up `.gitignore` for:
  - [ ] Node.js (`node_modules/`, `.env`)
  - [ ] iOS (Xcode build files, `*.xcuserstate`)
  - [ ] Android (`build/`, `.gradle/`)
  - [ ] IDE files (`.vscode/`, `.idea/`)
- [ ] Create initial commit with project structure
- [ ] Set up branch protection rules (main/master branch)

#### CI/CD Setup (Can be done in Phase 1, Task 1.8)
- [ ] Choose CI/CD platform (GitHub Actions recommended)
- [ ] Set up repository secrets for:
  - [ ] Database credentials
  - [ ] API keys
  - [ ] AWS credentials
- [ ] Configure automated testing pipeline

#### Development Tools
- [ ] Install required software:
  - [ ] Node.js 20 LTS
  - [ ] PostgreSQL 15+
  - [ ] Redis 7+
  - [ ] Docker & Docker Compose (for local dev)
  - [ ] Xcode (for iOS development)
  - [ ] Android Studio (for Android development)
- [ ] Set up code formatting (Prettier, ESLint)
- [ ] Set up TypeScript configuration

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
- [ ] **Finalize Technology Stack:**
  - [ ] Confirm Node.js + TypeScript (vs Python alternative)
  - [ ] Confirm Express.js (vs Fastify)
  - [ ] Confirm Prisma (vs TypeORM)

- [ ] **Database Decisions:**
  - [ ] Confirm PostgreSQL version (15+)
  - [ ] Decide on PostGIS extension (for geospatial queries)
  - [ ] Plan database migration strategy

- [ ] **API Design:**
  - [ ] Review and finalize API endpoint structure
  - [ ] Decide on API versioning strategy
  - [ ] Plan API documentation tool (Swagger/OpenAPI)

#### Missing Specifications
- [ ] **Image Processing:**
  - [ ] Define image size limits (currently says 5MB, confirm)
  - [ ] Define thumbnail dimensions (200x200, 800x800 mentioned)
  - [ ] Choose image processing service (AWS Lambda + Sharp vs server-side)

- [ ] **Rate Limiting:**
  - [ ] Define rate limits per endpoint
  - [ ] Define rate limits per user tier (if any)

- [ ] **Error Handling:**
  - [ ] Define standard error response format
  - [ ] Create error code catalog

---

### 10. Documentation

#### Technical Documentation
- [ ] **API Documentation:**
  - [ ] Set up API documentation tool (Swagger/OpenAPI)
  - [ ] Document all endpoints (can be done during development)

- [ ] **Development Documentation:**
  - [ ] Create `README.md` with setup instructions
  - [ ] Document local development setup
  - [ ] Document deployment process
  - [ ] Create architecture decision records (ADRs) for key decisions

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
- [ ] Finalize all guided question templates
- [ ] Create database seed file
- [ ] Test question flow with sample data

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
1. ✅ External service accounts (Mapbox, Foursquare, AWS)
2. ✅ Environment variables documented (email/password auth only for MVP)
3. ✅ Development tools installed
4. ✅ Git repository set up
5. ✅ Basic infrastructure decisions made

### Before Starting Phase 3 (Content Creation):
6. ✅ Guided questions templates defined
7. ✅ Image processing specifications finalized

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

Once you've completed the critical items (🔴), you're ready to start Phase 1, Task 1.1!

Use the implementation prompt from `IMPLEMENTATION_PROMPT.md` to begin development.

