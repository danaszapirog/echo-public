# Project Echo - AWS Infrastructure (CDK)

This directory contains AWS CDK code to provision all AWS resources for Project Echo.

## Prerequisites

1. **AWS Account**: You need an AWS account
2. **AWS CLI**: Install and configure AWS CLI
   ```bash
   brew install awscli  # macOS
   aws configure
   ```
3. **Node.js**: Install Node.js 18+ and npm
4. **CDK CLI**: Install AWS CDK
   ```bash
   npm install -g aws-cdk
   ```

## Setup

1. **Install dependencies:**
   ```bash
   cd infrastructure
   npm install
   ```

2. **Bootstrap CDK** (first time only):
   ```bash
   cdk bootstrap
   ```
   This creates the necessary resources in your AWS account for CDK to work.

3. **Review the stack:**
   ```bash
   cdk synth
   ```
   This generates CloudFormation templates without deploying.

4. **Preview changes:**
   ```bash
   cdk diff
   ```
   Shows what will be created/modified.

5. **Deploy infrastructure:**
   ```bash
   npm run deploy:dev
   ```
   Or:
   ```bash
   cdk deploy EchoInfraStack-dev
   ```

## What Gets Created

The CDK stack creates:

1. **S3 Bucket** (`echo-media-dev`)
   - Private bucket for media storage
   - CORS enabled for uploads
   - Encryption enabled
   - Auto-delete enabled for dev/staging

2. **CloudFront Distribution**
   - CDN for fast media delivery
   - HTTPS only
   - Caching optimized
   - Compression enabled

3. **IAM User** (`echo-backend-dev`)
   - User for backend application
   - Permissions to upload/get/delete objects in S3 bucket
   - You'll need to create access keys manually

## Post-Deployment Steps

After deploying, you need to:

1. **Create IAM Access Keys:**
   - Go to AWS Console → IAM → Users → `echo-backend-dev`
   - Security Credentials tab → Create Access Key
   - Copy Access Key ID and Secret Access Key

2. **Add to .env file:**
   ```bash
   AWS_ACCESS_KEY_ID=<access-key-id>
   AWS_SECRET_ACCESS_KEY=<secret-access-key>
   AWS_S3_BUCKET_NAME=echo-media-dev
   AWS_CLOUDFRONT_DOMAIN=<cloudfront-domain-from-output>
   AWS_REGION=us-east-1
   ```

3. **Get CloudFront domain:**
   - Check CDK outputs: `cdk list` then `cdk describe EchoInfraStack-dev`
   - Or check AWS Console → CloudFront → Distributions

## Environments

- **dev**: Development environment (auto-delete enabled)
- **staging**: Staging environment (commented out, uncomment when needed)
- **prod**: Production environment (commented out, uncomment when needed)

## Useful Commands

- `npm run build` - Compile TypeScript
- `npm run watch` - Watch for changes and compile
- `npm run deploy` - Deploy to default environment
- `npm run deploy:dev` - Deploy to dev
- `cdk diff` - Compare deployed stack with current state
- `cdk synth` - Emit the synthesized CloudFormation template
- `cdk destroy` - Destroy the stack (careful!)

## Cost Considerations

- **S3**: Pay for storage (~$0.023/GB/month) and requests
- **CloudFront**: Pay for data transfer (~$0.085/GB for first 10TB)
- **IAM**: Free

For MVP, costs should be minimal (< $10/month for low traffic).

## Security Notes

- S3 bucket is private (no public access)
- IAM user has minimal permissions (only S3 bucket access)
- CloudFront uses HTTPS only
- Consider adding bucket policies for more granular access control

## Future Enhancements

When ready, you can add:
- Lambda function for image processing (thumbnails)
- S3 bucket policies for pre-signed URLs
- CloudFront cache invalidation automation
- Monitoring and alerts (CloudWatch)
- Backup policies

