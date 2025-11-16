# AWS S3 Setup Guide

## Current Status
✅ AWS credentials are configured in `.env`
⚠️ CloudFront domain needs to be updated

## Current Configuration

- ✅ AWS_ACCESS_KEY_ID: Configured
- ✅ AWS_SECRET_ACCESS_KEY: Configured  
- ✅ AWS_S3_BUCKET_NAME: `echo-media-dev`
- ⚠️ AWS_CLOUDFRONT_DOMAIN: Placeholder value

## Steps to Complete Setup

### 1. Get CloudFront Domain

**Option A: From CDK Outputs**
```bash
cd infrastructure
npm run synth
# Look for CloudFrontDistributionDomainName in outputs
```

**Option B: From AWS Console**
1. Go to AWS Console → CloudFront
2. Find your distribution (should be for `echo-media-dev` bucket)
3. Copy the "Domain name" (e.g., `d1234abcd.cloudfront.net`)

**Option C: Check if Distribution Exists**
```bash
aws cloudfront list-distributions --query "DistributionList.Items[?Comment=='Echo Media CDN'].DomainName" --output text
```

### 2. Update .env File

Open `backend/.env` and update:
```bash
AWS_CLOUDFRONT_DOMAIN=d1234abcd.cloudfront.net
```

Replace with your actual CloudFront domain.

### 3. Verify S3 Bucket Permissions

Ensure your IAM user (`echo-backend-dev`) has these permissions:
- `s3:PutObject` - Upload files
- `s3:GetObject` - Read files
- `s3:DeleteObject` - Delete files

### 4. Test Avatar Upload

Create a test image file, then:
```bash
TOKEN="your-jwt-token"
curl -X POST http://localhost:3000/api/v1/users/me/avatar \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@test-image.jpg"
```

### 5. Verify Upload

Check S3 bucket:
```bash
aws s3 ls s3://echo-media-dev/avatars/
```

Or check CloudFront URL (if configured):
```
https://your-cloudfront-domain.cloudfront.net/avatars/{filename}
```

---

## Troubleshooting

### "Access Denied" Error
- Check IAM user has S3 permissions
- Verify bucket name is correct
- Check bucket policy allows your IAM user

### "Bucket not found"
- Verify bucket name: `echo-media-dev`
- Check AWS region is correct: `us-east-1`
- Ensure bucket exists in your AWS account

### CloudFront Not Working
- CloudFront is optional - S3 URLs will work without it
- Update `AWS_CLOUDFRONT_DOMAIN` when ready
- CDN provides faster global delivery

---

## Current Status

✅ **Ready to test:** Avatar upload should work with current AWS credentials
⚠️ **Optional:** Update CloudFront domain for CDN delivery

