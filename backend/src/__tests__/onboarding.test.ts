import { Request, Response, NextFunction } from 'express';
import {
  getLaunchCreatorsHandler,
  completeOnboardingHandler,
} from '../controllers/onboardingController';
import { getLaunchCreators, completeOnboarding } from '../services/onboardingService';
import { CustomError } from '../middleware/errorHandler';

// Mock the onboarding service
jest.mock('../services/onboardingService');

describe('Onboarding Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  const mockUser = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    role: 'consumer',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      user: mockUser,
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('getLaunchCreatorsHandler', () => {
    it('should return launch creators successfully', async () => {
      const mockCreators = [
        {
          id: '223e4567-e89b-12d3-a456-426614174000',
          username: 'creator1',
          bio: 'Food blogger',
          profile_picture_url: 'https://example.com/pic.jpg',
          playlist_count: 5,
          is_verified: true,
        },
      ];

      (getLaunchCreators as jest.Mock).mockResolvedValue(mockCreators);

      await getLaunchCreatorsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getLaunchCreators).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        creators: mockCreators,
        count: mockCreators.length,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle empty creators list', async () => {
      (getLaunchCreators as jest.Mock).mockResolvedValue([]);

      await getLaunchCreatorsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        creators: [],
        count: 0,
      });
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      (getLaunchCreators as jest.Mock).mockRejectedValue(error);

      await getLaunchCreatorsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('completeOnboardingHandler', () => {
    it('should complete onboarding successfully', async () => {
      mockRequest.body = {
        followed_creator_ids: [
          '223e4567-e89b-12d3-a456-426614174000',
          '323e4567-e89b-12d3-a456-426614174000',
        ],
      };

      (completeOnboarding as jest.Mock).mockResolvedValue(undefined);

      await completeOnboardingHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(completeOnboarding).toHaveBeenCalledWith(
        mockUser.userId,
        mockRequest.body.followed_creator_ids
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Onboarding completed successfully',
          onboarding_completed_at: expect.any(String),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await completeOnboardingHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Unauthorized',
          statusCode: 401,
        })
      );
      expect(completeOnboarding).not.toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      mockRequest.body = {
        followed_creator_ids: [], // Empty array should fail validation
      };

      await completeOnboardingHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(completeOnboarding).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      mockRequest.body = {
        followed_creator_ids: ['223e4567-e89b-12d3-a456-426614174000'],
      };

      const error = new CustomError('Invalid creator IDs', 400);
      (completeOnboarding as jest.Mock).mockRejectedValue(error);

      await completeOnboardingHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});

