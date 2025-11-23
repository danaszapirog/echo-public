import { Request, Response, NextFunction } from 'express';
import { getMapPinsHandler } from '../controllers/mapController';
import { getMapPins } from '../services/mapService';

// Mock the map service
jest.mock('../services/mapService');

describe('Map Controller', () => {
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
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('getMapPinsHandler', () => {
    it('should return map pins successfully', async () => {
      const mockPins = {
        pins: [
          {
            place_id: '223e4567-e89b-12d3-a456-426614174000',
            latitude: 40.7282,
            longitude: -73.9942,
            pin_type: 'spot' as const,
            spot_count: 2,
          },
        ],
        clusters: [],
      };

      mockRequest.query = {
        north: '40.8',
        south: '40.7',
        east: '-73.9',
        west: '-74.0',
      };

      (getMapPins as jest.Mock).mockResolvedValue(mockPins);

      await getMapPinsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getMapPins).toHaveBeenCalledWith(
        mockUser.userId,
        {
          north: 40.8,
          south: 40.7,
          east: -73.9,
          west: -74.0,
        },
        {
          zoom: undefined,
          includeNetwork: true,
        }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockPins);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle zoom parameter', async () => {
      const mockPins = {
        pins: [],
        clusters: [
          {
            latitude: 40.7282,
            longitude: -73.9942,
            count: 5,
          },
        ],
      };

      mockRequest.query = {
        north: '40.8',
        south: '40.7',
        east: '-73.9',
        west: '-74.0',
        zoom: '10',
      };

      (getMapPins as jest.Mock).mockResolvedValue(mockPins);

      await getMapPinsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getMapPins).toHaveBeenCalledWith(
        mockUser.userId,
        {
          north: 40.8,
          south: 40.7,
          east: -73.9,
          west: -74.0,
        },
        {
          zoom: 10,
          includeNetwork: true,
        }
      );
    });

    it('should handle include_network=false', async () => {
      mockRequest.query = {
        north: '40.8',
        south: '40.7',
        east: '-73.9',
        west: '-74.0',
        include_network: 'false',
      };

      (getMapPins as jest.Mock).mockResolvedValue({ pins: [], clusters: [] });

      await getMapPinsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(getMapPins).toHaveBeenCalledWith(
        mockUser.userId,
        expect.any(Object),
        {
          zoom: undefined,
          includeNetwork: false,
        }
      );
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.user = undefined;

      await getMapPinsHandler(
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
      expect(getMapPins).not.toHaveBeenCalled();
    });

    it('should return 400 if viewport parameters are missing', async () => {
      mockRequest.query = {};

      await getMapPinsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Viewport parameters (north, south, east, west) are required',
          statusCode: 400,
        })
      );
    });

    it('should return 400 if north <= south', async () => {
      mockRequest.query = {
        north: '40.7',
        south: '40.8',
        east: '-73.9',
        west: '-74.0',
      };

      await getMapPinsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'North must be greater than south',
          statusCode: 400,
        })
      );
    });

    it('should return 400 if east <= west', async () => {
      mockRequest.query = {
        north: '40.8',
        south: '40.7',
        east: '-74.0',
        west: '-73.9',
      };

      await getMapPinsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'East must be greater than west',
          statusCode: 400,
        })
      );
    });

    it('should return 400 if coordinates are out of bounds', async () => {
      mockRequest.query = {
        north: '91',
        south: '40.7',
        east: '-73.9',
        west: '-74.0',
      };

      await getMapPinsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Invalid viewport coordinates',
          statusCode: 400,
        })
      );
    });

    it('should handle service errors', async () => {
      mockRequest.query = {
        north: '40.8',
        south: '40.7',
        east: '-73.9',
        west: '-74.0',
      };

      const error = new Error('Database error');
      (getMapPins as jest.Mock).mockRejectedValue(error);

      await getMapPinsHandler(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});

