/**
 * Mock Image Service for Testing
 * Provides mock implementations of image upload/delete operations
 */

import { UploadResult } from '../services/imageService';

export const mockUploadResult: UploadResult = {
  url: 'https://test-cloudfront.net/avatars/mock-uuid.jpg',
  key: 'avatars/mock-uuid.jpg',
};

export const mockImageService = {
  uploadImage: jest.fn<Promise<UploadResult>, any[]>().mockResolvedValue(mockUploadResult),
  deleteImage: jest.fn<Promise<void>, [string]>().mockResolvedValue(undefined),
  extractS3Key: jest.fn<string | null, [string]>().mockImplementation((url: string) => {
    const match = url.match(/avatars\/(.+)$/);
    return match ? match[0] : null;
  }),
};

