/**
 * Mock AWS S3 Client for Testing
 * Provides mock implementations of S3 operations
 */

export const mockS3Client = {
  send: jest.fn().mockResolvedValue({
    ETag: '"mock-etag-123"',
    VersionId: 'mock-version-id',
  }),
};

export const mockS3BucketName = 'test-bucket';
export const mockCloudFrontDomain = 'test-cloudfront.net';

// Mock S3 config
export const mockS3Config = {
  s3Client: mockS3Client,
  S3_BUCKET_NAME: mockS3BucketName,
  CLOUDFRONT_DOMAIN: mockCloudFrontDomain,
};

