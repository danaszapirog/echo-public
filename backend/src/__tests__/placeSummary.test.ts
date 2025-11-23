import { Request, Response, NextFunction } from 'express';
import { getPlaceSummaryHandler } from '../controllers/placeController';
import { getPlaceSummary, getOrCreatePlace, getPlaceById } from '../services/placeService';
import { CustomError } from '../middleware/errorHandler';

// Mock the place service
jest.mock('../services/placeService');

describe('Place Summary Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  const mockUser = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    role: 'consumer',
  };

  beforeEach(() => {
    mockRequest = {
      user: mockUser,
      params: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('getPlaceSummaryHandler', () => {
    it('should return place summary successfully', async () => {
      const placeId = '223e4567-e89b-12d3-a456-426614174000';
      const mockSummary = {
        place_id: placeId,
        name: 'Joe\'s Pizza',
        primary_category: 'Pizza Place',
        network_spot_count: 5,
        average_rating: 4.6,
        common_tags: ['pizza', 'classic'],
      };

      mockRequest.params = { placeId };

      (getPlaceById as jest.Mock).mockResolvedValue({
        id: placeId,
        name: 'Joe\'s Pizza',
      });
      (getPlaceSummary as jest.Mock).mockResolvedValue(mockSummary);

      await getPlaceSummaryHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getPlaceSummary).toHaveBeenCalledWith(placeId, mockUser.userId);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockSummary);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle external place ID (non-UUID)', async () => {
      const externalPlaceId = 'foursquare_123';
      const internalPlaceId = '223e4567-e89b-12d3-a456-426614174000';
      const mockPlace = {
        id: internalPlaceId,
        externalPlaceId,
        name: 'Joe\'s Pizza',
      };
      const mockSummary = {
        place_id: internalPlaceId,
        name: 'Joe\'s Pizza',
        primary_category: 'Pizza Place',
        network_spot_count: 0,
        average_rating: null,
        common_tags: [],
      };

      mockRequest.params = { placeId: externalPlaceId };

      (getOrCreatePlace as jest.Mock).mockResolvedValue(mockPlace);
      (getPlaceSummary as jest.Mock).mockResolvedValue(mockSummary);

      await getPlaceSummaryHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getOrCreatePlace).toHaveBeenCalledWith(externalPlaceId, 'foursquare');
      expect(getPlaceSummary).toHaveBeenCalledWith(internalPlaceId, mockUser.userId);
    });

    it('should work without authentication', async () => {
      const placeId = '223e4567-e89b-12d3-a456-426614174000';
      const mockSummary = {
        place_id: placeId,
        name: 'Joe\'s Pizza',
        primary_category: 'Pizza Place',
        network_spot_count: 0,
        average_rating: null,
        common_tags: [],
      };

      mockRequest.params = { placeId };
      mockRequest.user = undefined;

      (getPlaceSummary as jest.Mock).mockResolvedValue(mockSummary);

      await getPlaceSummaryHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getPlaceSummary).toHaveBeenCalledWith(placeId, undefined);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
    });

    it('should handle place not found', async () => {
      const placeId = 'invalid-place-id';

      mockRequest.params = { placeId };

      (getOrCreatePlace as jest.Mock).mockResolvedValue(null);

      await getPlaceSummaryHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Place not found',
          statusCode: 404,
        })
      );
    });

    it('should handle service errors', async () => {
      const placeId = '223e4567-e89b-12d3-a456-426614174000';
      const error = new CustomError('Database error', 500);

      mockRequest.params = { placeId };

      (getPlaceSummary as jest.Mock).mockRejectedValue(error);

      await getPlaceSummaryHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});

