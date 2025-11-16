import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface EchoInfraStackProps extends cdk.StackProps {
  environment: 'dev' | 'staging' | 'prod';
}

export class EchoInfraStack extends cdk.Stack {
  public readonly mediaBucket: s3.Bucket;
  public readonly cloudFrontDistribution: cloudfront.Distribution;
  public readonly uploadUser: iam.User;

  constructor(scope: Construct, id: string, props: EchoInfraStackProps) {
    super(scope, id, props);

    const { environment } = props;
    const bucketName = `echo-media-${environment}`;

    // ============================================================================
    // S3 Bucket for Media Storage
    // ============================================================================
    this.mediaBucket = new s3.Bucket(this, 'MediaBucket', {
      bucketName: bucketName,
      versioned: false,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Private bucket
      removalPolicy: environment === 'prod' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: environment !== 'prod', // Auto-delete for dev/staging
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
          allowedOrigins: ['*'], // Restrict in production
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
    });

    // ============================================================================
    // CloudFront Distribution for CDN
    // ============================================================================
    this.cloudFrontDistribution = new cloudfront.Distribution(this, 'MediaDistribution', {
      defaultBehavior: {
        origin: new cloudfrontOrigins.S3Origin(this.mediaBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
      comment: `Project Echo Media CDN - ${environment}`,
      enabled: true,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // Use only North America and Europe
    });

    // ============================================================================
    // IAM User for Backend Application (S3 Uploads)
    // ============================================================================
    this.uploadUser = new iam.User(this, 'BackendUploadUser', {
      userName: `echo-backend-${environment}`,
    });

    // Policy for S3 bucket access
    const s3Policy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        's3:PutObject',
        's3:PutObjectAcl',
        's3:GetObject',
        's3:DeleteObject',
        's3:ListBucket',
      ],
      resources: [
        this.mediaBucket.bucketArn,
        `${this.mediaBucket.bucketArn}/*`,
      ],
    });

    this.uploadUser.addToPolicy(s3Policy);

    // ============================================================================
    // Outputs
    // ============================================================================
    new cdk.CfnOutput(this, 'MediaBucketName', {
      value: this.mediaBucket.bucketName,
      description: 'S3 Bucket name for media storage',
      exportName: `EchoMediaBucket-${environment}`,
    });

    new cdk.CfnOutput(this, 'MediaBucketArn', {
      value: this.mediaBucket.bucketArn,
      description: 'S3 Bucket ARN',
    });

    new cdk.CfnOutput(this, 'CloudFrontDomainName', {
      value: this.cloudFrontDistribution.distributionDomainName,
      description: 'CloudFront distribution domain name',
      exportName: `EchoCloudFront-${environment}`,
    });

    new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
      value: this.cloudFrontDistribution.distributionId,
      description: 'CloudFront distribution ID',
    });

    new cdk.CfnOutput(this, 'UploadUserAccessKeyId', {
      value: 'Create access key manually in AWS Console',
      description: 'Create access key for upload user in IAM Console',
    });

    // ============================================================================
    // Instructions Output
    // ============================================================================
    new cdk.CfnOutput(this, 'SetupInstructions', {
      value: `
After deployment:
1. Go to IAM Console → Users → echo-backend-${environment}
2. Create Access Key (Security Credentials tab)
3. Add credentials to your .env file:
   AWS_ACCESS_KEY_ID=<access-key-id>
   AWS_SECRET_ACCESS_KEY=<secret-access-key>
   AWS_S3_BUCKET_NAME=${bucketName}
   AWS_CLOUDFRONT_DOMAIN=${this.cloudFrontDistribution.distributionDomainName}
      `,
      description: 'Post-deployment setup instructions',
    });
  }
}

