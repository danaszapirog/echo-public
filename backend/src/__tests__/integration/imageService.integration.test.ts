/**
 * Integration Tests for Image Service
 * These tests use REAL AWS S3 (requires valid AWS credentials)
 * 
 * To run: npm test -- --config jest.config.integration.js imageService.integration.test.ts
 * 
 * Note: These tests require:
 * - Valid AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env
 * - Valid AWS_S3_BUCKET_NAME in .env
 * - Network connectivity
 * - Will actually upload/delete files in S3
 */

import { uploadImage, deleteImage, extractS3Key } from '../../services/imageService';
import * as fs from 'fs';
import * as path from 'path';

// Don't mock - use real services
// jest.mock is NOT called here

describe('Image Service - Integration Tests (Real S3)', () => {
  // Skip if AWS not configured
  const hasAwsConfig = !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET_NAME
  );
  
  const testIf = hasAwsConfig ? it : it.skip;

  let testImagePath: string;
  let uploadedKey: string | null = null;

  beforeAll(() => {
    if (!hasAwsConfig) {
      console.warn('⚠️  AWS credentials not configured - skipping integration tests');
    }

    // Create a small test image file (1x1 pixel PNG)
    const testImageBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    testImagePath = path.join(__dirname, '../../../../test-image.png');
    fs.writeFileSync(testImagePath, testImageBuffer);
  });

  afterAll(() => {
    // Clean up test image file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }

    // Clean up uploaded file if test succeeded
    if (uploadedKey && hasAwsConfig) {
      deleteImage(uploadedKey).catch(console.error);
    }
  });

  describe('uploadImage', () => {
    testIf('should upload image to real S3', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'test.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 100,
        buffer: fs.readFileSync(testImagePath),
        destination: '',
        filename: '',
        path: '',
        stream: {} as any,
      };

      const result = await uploadImage(mockFile, 'test-uploads');

      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('key');
      expect(result.url).toMatch(/^https:\/\//);
      expect(result.key).toContain('test-uploads/');

      uploadedKey = result.key;
    }, 30000); // 30 second timeout for real S3 upload

    testIf('should generate CloudFront URL if configured', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'test.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 100,
        buffer: fs.readFileSync(testImagePath),
        destination: '',
        filename: '',
        path: '',
        stream: {} as any,
      };

      const result = await uploadImage(mockFile, 'test-uploads');

      if (process.env.AWS_CLOUDFRONT_DOMAIN) {
        expect(result.url).toContain(process.env.AWS_CLOUDFRONT_DOMAIN);
      } else {
        expect(result.url).toContain('.s3.');
      }
    }, 30000);
  });

  describe('deleteImage', () => {
    testIf('should delete image from real S3', async () => {
      // First upload an image
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'test.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 100,
        buffer: fs.readFileSync(testImagePath),
        destination: '',
        filename: '',
        path: '',
        stream: {} as any,
      };

      const uploadResult = await uploadImage(mockFile, 'test-delete');
      
      // Then delete it
      await expect(deleteImage(uploadResult.key)).resolves.not.toThrow();
    }, 30000);
  });

  describe('extractS3Key', () => {
    it('should extract key from CloudFront URL', () => {
      const url = 'https://test-cloudfront.net/avatars/test-key.jpg';
      const key = extractS3Key(url);
      expect(key).toBe('avatars/test-key.jpg');
    });

    it('should extract key from S3 URL', () => {
      const url = 'https://test-bucket.s3.us-east-1.amazonaws.com/avatars/test-key.jpg';
      const key = extractS3Key(url);
      expect(key).toBe('avatars/test-key.jpg');
    });
  });
});

