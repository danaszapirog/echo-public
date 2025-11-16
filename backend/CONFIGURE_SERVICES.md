# Configuring External Services for Phase 2

This guide will help you configure Foursquare API and AWS S3 for Phase 2 features.

---

## 1. Foursquare Places API

### Step 1: Get Foursquare API Key

1. Go to https://developer.foursquare.com/
2. Sign up or log in to your account
3. Navigate to "My Apps" or create a new app
4. In your app dashboard, you'll see an "API Key" section
5. Copy your API Key (it should look like: `fsq3...`)

### Step 2: Add to .env

Open `backend/.env` and add/update:
```bash
FOURSQUARE_API_KEY=your-actual-api-key-here
FOURSQUARE_API_VERSION=20240101
```

### Step 3: Test

```bash
curl "http://localhost:3000/api/v1/places/search?q=pizza&lat=40.7128&lng=-74.0060&limit=5"
```

---

## 2. AWS S3 (for Profile Picture Upload)

### Step 1: Get AWS Credentials

If you've already deployed AWS infrastructure (from Phase 1 setup), you should have:
- IAM User: `echo-backend-dev`
- S3 Bucket: `echo-media-dev` (or similar)

**Get Access Keys:**
1. Go to AWS Console → IAM → Users → `echo-backend-dev`
2. Click "Security credentials" tab
3. Click "Create access key"
4. Copy Access Key ID and Secret Access Key

### Step 2: Get S3 Bucket Name

From your CDK deployment output, or check AWS Console → S3:
- Bucket name should be: `echo-media-dev` (or similar)

### Step 3: Get CloudFront Domain (Optional)

If you deployed CloudFront with CDK:
- Check CDK outputs: `cdk list` then `cdk describe EchoInfraStack-dev`
- Or check AWS Console → CloudFront → Distributions

### Step 4: Add to .env

Open `backend/.env` and add/update:
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET_NAME=echo-media-dev
AWS_CLOUDFRONT_DOMAIN=your-cloudfront-domain.cloudfront.net  # Optional
```

### Step 5: Test Avatar Upload

```bash
TOKEN="your-jwt-token"
curl -X POST http://localhost:3000/api/v1/users/me/avatar \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@/path/to/test-image.jpg"
```

---

## 3. Mapbox (Optional - for Phase 6)

If you want to prepare for Phase 6 (Map features):

1. Go to https://account.mapbox.com/access-tokens/
2. Copy your access token
3. Add to `.env`:
```bash
MAPBOX_ACCESS_TOKEN=your-mapbox-token
```

---

## Quick Configuration Checklist

- [ ] Foursquare API Key obtained and added to `.env`
- [ ] AWS Access Key ID obtained and added to `.env`
- [ ] AWS Secret Access Key obtained and added to `.env`
- [ ] AWS S3 Bucket Name added to `.env`
- [ ] CloudFront Domain added to `.env` (optional)
- [ ] Tested place search endpoint
- [ ] Tested avatar upload endpoint

---

## Troubleshooting

### "Invalid Foursquare API key"
- Verify the API key is correct
- Check for extra spaces in `.env`
- Ensure `FOURSQUARE_API_KEY` is set

### "AWS credentials not configured"
- Verify AWS credentials are correct
- Check IAM user has S3 permissions
- Ensure bucket name matches

### "Access Denied" on S3 upload
- Check IAM user has `s3:PutObject` permission
- Verify bucket name is correct
- Check bucket CORS settings (should be configured by CDK)

---

## Security Notes

- Never commit `.env` file to Git
- Rotate credentials regularly
- Use different credentials for production
- Store production secrets in AWS Secrets Manager

