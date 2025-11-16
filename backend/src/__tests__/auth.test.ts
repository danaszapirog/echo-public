import { Request, Response, NextFunction } from 'express';
import { register, login } from '../controllers/authController';
import { registerUser, loginUser } from '../services/authService';
import { CustomError } from '../middleware/errorHandler';

// Mock the auth service
jest.mock('../services/authService');

describe('Auth Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        role: 'consumer',
      };
      const mockTokens = {
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      };

      (registerUser as jest.Mock).mockResolvedValue({
        user: mockUser,
        ...mockTokens,
      });

      mockRequest.body = {
        email: 'test@example.com',
        password: 'Password123',
        username: 'testuser',
      };

      await register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(registerUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123',
        username: 'testuser',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: mockUser,
        ...mockTokens,
      });
    });

    it('should return 400 for invalid input', async () => {
      mockRequest.body = {
        email: 'invalid-email',
        password: '123',
        username: 'ab',
      };

      await register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation error',
        })
      );
    });

    it('should handle duplicate email error', async () => {
      const error = new CustomError('Email already registered', 409);
      (registerUser as jest.Mock).mockRejectedValue(error);

      mockRequest.body = {
        email: 'existing@example.com',
        password: 'Password123',
        username: 'newuser',
      };

      await register(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        username: 'testuser',
        role: 'consumer',
      };
      const mockTokens = {
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      };

      (loginUser as jest.Mock).mockResolvedValue({
        user: mockUser,
        ...mockTokens,
      });

      mockRequest.body = {
        email: 'test@example.com',
        password: 'Password123',
      };

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(loginUser).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        user: mockUser,
        ...mockTokens,
      });
    });

    it('should return 400 for invalid input', async () => {
      mockRequest.body = {
        email: 'invalid-email',
        password: '',
      };

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation error',
        })
      );
    });

    it('should handle invalid credentials', async () => {
      const error = new CustomError('Invalid email or password', 401);
      (loginUser as jest.Mock).mockRejectedValue(error);

      mockRequest.body = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      await login(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});

