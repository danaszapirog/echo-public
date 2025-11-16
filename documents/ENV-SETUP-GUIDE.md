# Environment Variables Setup Guide

This guide will help you configure your `.env` file with the credentials you've obtained from various services.

## Quick Setup

### Step 1: Create .env File

Since the backend directory doesn't exist yet, you can create the `.env` file in the root directory for now. When you create the backend directory in Phase 1, you can move it there.

```bash
# Copy the example file
cp documents/env.example .env
```

### Step 2: Fill in Your Credentials

Open `.env` in your editor and replace the placeholder values with your actual credentials.

## Required Credentials for MVP

### ✅ Critical (Required for Phase 2+)

#### Mapbox Access Token
1. Go to https://account.mapbox.com/access-tokens/
2. Copy your default public token (or create a new one)
3. Paste it in `.env`:
   ```
   MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImN... (your actual token)
   ```

#### Foursquare API Credentials
1. Go to https://developer.foursquare.com/
2. Navigate to your app's credentials page
3. Generate an API Key (independent option in the dashboard)
4. Copy your API Key
5. Paste it in `.env`:
   ```
   FOURSQUARE_API_KEY=your-actual-api-key-here
   ```
   **Note:** Foursquare Places API v3 only requires an API key (not OAuth Client Secret). The API key is used directly in the `Authorization` header.

#### AWS Credentials (Using CDK)

**Option 1: Use CDK (Recommended)**

1. **Install prerequisites:**
   ```bash
   # Install AWS CLI (if not already installed)
   brew install awscli  # macOS
   aws configure  # Configure your AWS credentials
   
   # Install CDK CLI
   npm install -g aws-cdk
   ```

2. **Deploy infrastructure:**
   ```bash
   cd infrastructure
   npm install
   cdk bootstrap  # First time only
   npm run deploy:dev
   ```

3. **Get credentials from CDK outputs:**
   - After deployment, CDK will output instructions
   - Go to AWS Console → IAM → Users → `echo-backend-dev`
   - Security Credentials tab → Create Access Key
   - Copy Access Key ID and Secret Access Key

4. **Add to .env:**
   ```
   AWS_ACCESS_KEY_ID=<access-key-from-iam-user>
   AWS_SECRET_ACCESS_KEY=<secret-key-from-iam-user>
   AWS_S3_BUCKET_NAME=echo-media-dev  # From CDK output
   AWS_CLOUDFRONT_DOMAIN=<cloudfront-domain-from-cdk-output>
   AWS_REGION=us-east-1
   ```

**Option 2: Manual Setup (Not Recommended)**

If you prefer manual setup:
1. Go to AWS Console → IAM → Users → Your User → Security Credentials
2. Create Access Key (if you don't have one)
3. Create S3 bucket named `echo-media-dev`
4. Set up CloudFront distribution manually
5. Add credentials to `.env`

### ⚠️ Important: Generate JWT Secret

Generate a strong random secret for JWT tokens:

```bash
openssl rand -base64 32
```

Copy the output and paste it in `.env`:
```
JWT_SECRET=<paste-generated-secret-here>
```

### 🔧 Development Setup (Can use defaults for now)

#### Database (PostgreSQL)
For local development, you can use:
```
DATABASE_URL=postgresql://echo_user:echo_password@localhost:5432/echo_dev
```

**To set up PostgreSQL locally:**
- Install PostgreSQL: `brew install postgresql@15` (macOS) or download from postgresql.org
- Start PostgreSQL: `brew services start postgresql@15`
- Create database: `createdb echo_dev`
- Create user: `psql -c "CREATE USER echo_user WITH PASSWORD 'echo_password';"`
- Grant privileges: `psql -c "GRANT ALL PRIVILEGES ON DATABASE echo_dev TO echo_user;"`

#### Redis
For local development:
```
REDIS_URL=redis://localhost:6379
```

**To set up Redis locally:**
- Install Redis: `brew install redis` (macOS) or download from redis.io
- Start Redis: `brew services start redis`
- Or run: `redis-server`

## Credential Checklist

Use this checklist to track which credentials you've obtained:

### ✅ Mapbox
- [ ] Account created
- [ ] Access token obtained
- [ ] Token added to `.env`

### ✅ Foursquare
- [ ] Developer account created
- [ ] App created
- [ ] API Key generated (independent option in dashboard)
- [ ] API Key added to `.env`

### ✅ AWS (Using CDK)
- [ ] AWS account created
- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] CDK CLI installed (`npm install -g aws-cdk`)
- [ ] Infrastructure deployed (`cd infrastructure && npm install && cdk bootstrap && npm run deploy:dev`)
- [ ] IAM access keys created for `echo-backend-dev` user
- [ ] Access Key ID obtained
- [ ] Secret Access Key obtained
- [ ] S3 bucket name from CDK output
- [ ] CloudFront domain from CDK output
- [ ] All credentials added to `.env`

### ✅ Security
- [ ] JWT secret generated (`openssl rand -base64 32`)
- [ ] JWT secret added to `.env`

### ⏳ Optional (Can set up later)
- [ ] PostgreSQL installed and running
- [ ] Redis installed and running
- [ ] Database created
- [ ] CloudFront distribution (already created by CDK)

## Security Best Practices

1. **Never commit `.env` to git**
   - Check that `.env` is in `.gitignore`
   - Only commit `env.example` (without real values)

2. **Use different values for each environment**
   - Development: `.env` (local)
   - Staging: `.env.staging` (or environment variables)
   - Production: Use AWS Secrets Manager or similar

3. **Rotate secrets regularly**
   - Especially in production
   - If a secret is compromised, rotate immediately

4. **Store production secrets securely**
   - Use AWS Secrets Manager
   - Use environment variables in your hosting platform
   - Never hardcode secrets in code

## Testing Your Configuration

Once you've filled in your credentials, you can test them:

### Test Mapbox Token
```bash
curl "https://api.mapbox.com/tokens/v2?access_token=YOUR_TOKEN"
```

### Test Foursquare API
```bash
curl "https://api.foursquare.com/v3/places/search?query=pizza&ll=40.7,-74" \
  -H "Authorization: YOUR_API_KEY"
```

### Test AWS Credentials
```bash
aws s3 ls --profile default
# Or configure AWS CLI: aws configure
```

## Next Steps

Once your `.env` file is configured:
1. Verify `.env` is in `.gitignore`
2. Start Phase 1 implementation
3. The backend will read these environment variables when it starts

## Troubleshooting

### "Cannot find module 'dotenv'"
- Install dotenv: `npm install dotenv`

### "Invalid credentials"
- Double-check you copied the full token/key (no extra spaces)
- Verify credentials are active in the service dashboard

### "Database connection failed"
- Check PostgreSQL is running: `pg_isready`
- Verify database exists: `psql -l | grep echo_dev`
- Check connection string format

### "Redis connection failed"
- Check Redis is running: `redis-cli ping` (should return "PONG")
- Verify Redis URL format

