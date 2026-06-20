import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../../common/security/password.service';
import { TokenService } from './token.service';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let passwordService: PasswordService;
  let tokenService: TokenService;

  const mockPrisma = {
    employee: {
      findUnique: jest.fn(),
    },
    tourist: {
      findFirst: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockPasswordService = {
    compare: jest.fn(),
    hash: jest.fn(),
  };

  const mockTokenService = {
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
    getRefreshTokenExpiry: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PasswordService, useValue: mockPasswordService },
        { provide: TokenService, useValue: mockTokenService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    passwordService = module.get<PasswordService>(PasswordService);
    tokenService = module.get<TokenService>(TokenService);

    mockPrisma.employee.findUnique.mockResolvedValue(null);
    mockPrisma.tourist.findFirst.mockResolvedValue(null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully as employee with valid credentials', async () => {
      const loginDto = { email: 'admin@mlakumulu.com', password: 'password123' };
      const mockEmployee = {
        id: 'employee-id',
        email: 'admin@mlakumulu.com',
        password: 'hashed-password',
        role: Role.ADMIN,
        isActive: true,
      };

      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);
      mockPasswordService.compare.mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockReturnValue('access-token');
      mockTokenService.generateRefreshToken.mockResolvedValue({
        refreshToken: 'raw-refresh-token',
        refreshTokenHash: 'hashed-refresh-token',
      });
      mockTokenService.getRefreshTokenExpiry.mockReturnValue(new Date());

      const result = await service.login(loginDto);

      expect(prisma.employee.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(passwordService.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockEmployee.password,
      );
      expect(prisma.refreshToken.create).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'raw-refresh-token',
      });
    });

    it('should login successfully as tourist with valid credentials', async () => {
      const loginDto = { email: 'tourist@mlakumulu.com', password: 'password123' };
      const mockTourist = {
        id: 'tourist-id',
        email: 'tourist@mlakumulu.com',
        password: 'hashed-password',
        status: 'ACTIVE',
      };

      mockPrisma.employee.findUnique.mockResolvedValue(null);
      mockPrisma.tourist.findFirst.mockResolvedValue(mockTourist);
      mockPasswordService.compare.mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockReturnValue('access-token');
      mockTokenService.generateRefreshToken.mockResolvedValue({
        refreshToken: 'raw-refresh-token',
        refreshTokenHash: 'hashed-refresh-token',
      });
      mockTokenService.getRefreshTokenExpiry.mockReturnValue(new Date());

      const result = await service.login(loginDto);

      expect(prisma.tourist.findFirst).toHaveBeenCalledWith({
        where: { email: loginDto.email, deletedAt: null },
      });
      expect(passwordService.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockTourist.password,
      );
      expect(prisma.refreshToken.create).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'raw-refresh-token',
      });
    });

    it('should throw UnauthorizedException if employee is inactive', async () => {
      const mockEmployee = {
        id: 'employee-id',
        email: 'inactive@test.com',
        isActive: false,
      };
      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);

      await expect(
        service.login({ email: 'inactive@test.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if tourist is inactive/blacklisted', async () => {
      const mockTourist = {
        id: 'tourist-id',
        email: 'inactive-tourist@test.com',
        status: 'INACTIVE',
      };
      mockPrisma.employee.findUnique.mockResolvedValue(null);
      mockPrisma.tourist.findFirst.mockResolvedValue(mockTourist);

      await expect(
        service.login({ email: 'inactive-tourist@test.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if neither employee nor tourist exists', async () => {
      mockPrisma.employee.findUnique.mockResolvedValue(null);
      mockPrisma.tourist.findFirst.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nonexistent@test.com', password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password (employee)', async () => {
      const mockEmployee = {
        id: 'employee-id',
        email: 'admin@mlakumulu.com',
        password: 'hashed-password',
        isActive: true,
      };
      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);
      mockPasswordService.compare.mockResolvedValue(false);

      await expect(
        service.login({ email: 'admin@mlakumulu.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should return a new pair of tokens when valid refresh token is provided', async () => {
      const refreshTokenDto = { refreshToken: 'valid-refresh-token' };
      const expiryDate = new Date(Date.now() + 100000);
      const storedTokens = [
        {
          id: 'token-id',
          employeeId: 'employee-id',
          tokenHash: 'hashed-refresh-token',
          expiresAt: expiryDate,
          revokedAt: null,
        },
      ];
      const mockEmployee = {
        id: 'employee-id',
        role: Role.STAFF,
        isActive: true,
      };

      mockPrisma.refreshToken.findMany.mockResolvedValue(storedTokens);
      mockTokenService.verifyRefreshToken.mockResolvedValue(true);
      mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);
      mockTokenService.generateRefreshToken.mockResolvedValue({
        refreshToken: 'new-refresh-token',
        refreshTokenHash: 'new-hashed-refresh-token',
      });
      mockTokenService.getRefreshTokenExpiry.mockReturnValue(expiryDate);
      mockTokenService.generateAccessToken.mockReturnValue('new-access-token');

      const result = await service.refresh(refreshTokenDto);

      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'token-id' },
        data: expect.any(Object),
      });
      expect(prisma.refreshToken.create).toHaveBeenCalled();
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
    });

    it('should throw UnauthorizedException if token is expired', async () => {
      const storedTokens = [
        {
          id: 'token-id',
          employeeId: 'employee-id',
          tokenHash: 'hashed-refresh-token',
          expiresAt: new Date(Date.now() - 1000), // Expired
          revokedAt: null,
        },
      ];

      mockPrisma.refreshToken.findMany.mockResolvedValue(storedTokens);
      mockTokenService.verifyRefreshToken.mockResolvedValue(true);

      await expect(
        service.refresh({ refreshToken: 'expired-token' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'token-id' },
        data: { revokedAt: expect.any(Date) },
      });
    });

    it('should throw UnauthorizedException if no matching valid refresh token is found', async () => {
      mockPrisma.refreshToken.findMany.mockResolvedValue([]);

      await expect(
        service.refresh({ refreshToken: 'invalid-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should revoke all refresh tokens for the employee', async () => {
      const employeeId = 'employee-id';

      await service.logout(employeeId);

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: {
          employeeId,
          revokedAt: null,
        },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });
});
