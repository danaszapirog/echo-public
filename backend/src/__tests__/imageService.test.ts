// Mock dependencies before importing
jest.mock('../config/s3', () => ({
  s3Client: {
    send: jest.fn(),
  },
  S3_BUCKET_NAME: 'test-bucket',
  CLOUDFRONT_DOMAIN: 'test-cloudfront.net',
}));

jest.mock('../config/env', () => ({
  default: {
    AWS_REGION: 'us-east-1',
  },
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-1234'),
}));

import { uploadImage, deleteImage } from '../services/imageService';
import { s3Client } from '../config/s3';

describe('Image Service', () => {
  const mockFile: Express.Multer.File = {
    fieldname: 'image',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('fake-image-data'),
    destination: '',
    filename: '',
    path: '',
    stream: {} as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('should upload image to S3 successfully', async () => {
      (s3Client.send as jest.Mock).mockResolvedValue({
        ETag: '"mock-etag"',
      });

      const result = await uploadImage(mockFile, 'avatars');

      expect(s3Client.send).toHaveBeenCalled();
      expect(result.url).toContain('test-cloudfront.net');
      expect(result.key).toContain('avatars/');
      expect(result.key).toMatch(/\.jpg$/);
    });

    it('should generate correct URL format', async () => {
      const result = await uploadImage(mockFile, 'avatars');

      expect(result.url).toMatch(/^https:\/\//);
      expect(result.url).toContain('avatars');
      expect(result.key).toMatch(/^avatars\/.+\.[a-z]+$/);
    });

    it('should throw error if no file provided', async () => {
      await expect(uploadImage(null as any, 'avatars')).rejects.toThrow('No file provided');
    });
  });

  describe('deleteImage', () => {
    it('should delete image from S3', async () => {
      (s3Client.send as jest.Mock).mockResolvedValue({});

      await deleteImage('avatars/test-key.jpg');

      expect(s3Client.send).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            Bucket: 'test-bucket',
            Key: 'avatars/test-key.jpg',
          }),
        })
      );
    });
  });

  describe('extractS3Key', () => {
    it('should extract key from CloudFront URL', async () => {
      const imageService = await import('../services/imageService');
      const key = imageService.extractS3Key('https://test-cloudfront.net/avatars/test-key.jpg');

      expect(key).toBe('avatars/test-key.jpg');
    });

    it('should extract key from S3 URL', async () => {
      const imageService = await import('../services/imageService');
      const key = imageService.extractS3Key('https://test-bucket.s3.us-east-1.amazonaws.com/avatars/test-key.jpg');

      expect(key).toBe('avatars/test-key.jpg');
    });

    it('should return null for invalid URL', async () => {
      const imageService = await import('../services/imageService');
      const key = imageService.extractS3Key('https://example.com/image.jpg');

      expect(key).toBeNull();
    });
  });
});

