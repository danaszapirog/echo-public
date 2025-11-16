# Echo Backend API

Backend API server for Project Echo - Social Recommendation App.

## Prerequisites

- Node.js 20+ 
- PostgreSQL 15+ (or Docker)
- Redis 7+ (or Docker)
- Docker & Docker Compose (optional, for containerized development)

## Quick Start with Docker (Recommended)

1. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values (JWT_SECRET is required)
   ```

2. **Start services with Docker Compose:**
   ```bash
   docker-compose up -d postgres redis
   ```

3. **Run database migrations:**
   ```bash
   npm run migrate
   npm run generate
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Setup Without Docker

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Set up database:**
   ```bash
   npm run migrate
   npm run generate
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Docker Development

### Using Docker Compose (Full Stack)

Start all services (PostgreSQL, Redis, Backend):
```bash
docker-compose up
```

Start only database services:
```bash
docker-compose up -d postgres redis
```

Stop services:
```bash
docker-compose down
```

Stop and remove volumes:
```bash
docker-compose down -v
```

### Building Docker Image

```bash
docker build -t echo-backend .
```

### Running Docker Container

```bash
docker run -p 3000:3000 --env-file .env echo-backend
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server (requires build first)
- `npm test` - Run tests
- `npm test:watch` - Run tests in watch mode
- `npm test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run migrate` - Run database migrations
- `npm run migrate:deploy` - Deploy migrations (production)
- `npm run migrate:reset` - Reset database (development only)
- `npm run generate` - Generate Prisma Client
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Project Structure

```
backend/
├── src/
│   ├── config/       # Configuration files
│   ├── controllers/  # Request handlers
│   ├── middleware/   # Express middleware
│   ├── models/       # Data models
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   ├── utils/        # Utility functions
│   └── __tests__/    # Test files
├── prisma/           # Prisma schema and migrations
└── dist/             # Compiled JavaScript (generated)
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### Health Check
- `GET /health` - Server health check

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm test:coverage
```

## CI/CD

GitHub Actions workflow is configured in `.github/workflows/ci.yml`. It runs:
- Linting
- Tests
- TypeScript build
- Infrastructure validation (on infrastructure changes)

## Environment Variables

See `.env.example` for all required environment variables.

### Required for MVP:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens (min 32 characters)

### Optional (can be added later):
- `REDIS_URL` - Redis connection string
- `AWS_*` - AWS credentials for S3/CloudFront
- `MAPBOX_ACCESS_TOKEN` - Mapbox API token
- `FOURSQUARE_API_KEY` - Foursquare API key

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running: `pg_isready`
- Check DATABASE_URL format: `postgresql://user:password@host:port/database`
- Verify database exists: `psql -l | grep echo_dev`

### Redis Connection Issues
- Ensure Redis is running: `redis-cli ping`
- Check REDIS_URL format: `redis://host:port`

### Port Already in Use
- Change PORT in `.env` file
- Or stop the process using port 3000: `lsof -ti:3000 | xargs kill`

