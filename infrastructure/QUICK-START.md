# Quick Start: Deploy AWS Infrastructure with CDK

## Prerequisites

1. **AWS Account** - Sign up at https://aws.amazon.com
2. **AWS CLI** - Install and configure:
   ```bash
   brew install awscli  # macOS
   aws configure  # Enter your AWS Access Key ID, Secret Access Key, region
   ```
3. **Node.js** - Version 18+ (check with `node --version`)
4. **CDK CLI** - Install globally:
   ```bash
   npm install -g aws-cdk
   ```

## Deploy Infrastructure

```bash
# 1. Navigate to infrastructure directory
cd infrastructure

# 2. Install dependencies
npm install

# 3. Bootstrap CDK (first time only - creates resources CDK needs)
cdk bootstrap

# 4. Preview what will be created (optional)
cdk synth

# 5. See what will change (optional)
cdk diff

# 6. Deploy infrastructure
npm run deploy:dev
# Or: cdk deploy EchoInfraStack-dev
```

## After Deployment

1. **Get IAM Access Keys:**
   - Go to AWS Console → IAM → Users → `echo-backend-dev`
   - Click "Security credentials" tab
   - Click "Create access key"
   - Copy Access Key ID and Secret Access Key

2. **Get CDK Outputs:**
   - After deployment, CDK will show outputs in the terminal
   - Or check AWS Console → CloudFormation → Stacks → `EchoInfraStack-dev` → Outputs
   - You'll need:
     - `MediaBucketName` (e.g., `echo-media-dev`)
     - `CloudFrontDomainName` (e.g., `d1234567890abc.cloudfront.net`)

3. **Add to .env file:**
   ```bash
   cd ..  # Back to project root
   cp documents/env.example .env
   # Edit .env and add:
   AWS_ACCESS_KEY_ID=<access-key-from-step-1>
   AWS_SECRET_ACCESS_KEY=<secret-key-from-step-1>
   AWS_S3_BUCKET_NAME=<bucket-name-from-outputs>
   AWS_CLOUDFRONT_DOMAIN=<cloudfront-domain-from-outputs>
   AWS_REGION=us-east-1
   ```

## What Gets Created

- ✅ **S3 Bucket** (`echo-media-dev`) - Private bucket for media storage
- ✅ **CloudFront Distribution** - CDN for fast media delivery
- ✅ **IAM User** (`echo-backend-dev`) - User with S3 permissions

## Useful Commands

- `cdk synth` - Generate CloudFormation template
- `cdk diff` - Compare deployed stack with current state
- `cdk deploy` - Deploy stack
- `cdk destroy` - **⚠️ Destroy stack** (careful!)
- `cdk list` - List all stacks

## Troubleshooting

### "CDK bootstrap required"
Run: `cdk bootstrap`

### "No credentials found"
Run: `aws configure` and enter your AWS credentials

### "Cannot find module"
Run: `npm install` in the infrastructure directory

### "Stack already exists"
If you need to update, just run `cdk deploy` again. CDK will update the existing stack.

## Cost Estimate

- **S3 Storage**: ~$0.023/GB/month (free tier: 5GB for 12 months)
- **CloudFront**: ~$0.085/GB for first 10TB (free tier: 1TB/month for 12 months)
- **IAM**: Free

**Estimated monthly cost for MVP**: < $10/month (with free tier)

## Next Steps

After deploying infrastructure:
1. Add AWS credentials to `.env` file
2. Continue with other service setup (Mapbox, Foursquare)
3. Start Phase 1 implementation

