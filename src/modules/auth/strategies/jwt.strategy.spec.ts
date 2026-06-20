import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: PrismaService;

  const mockPrisma = {
    employee: {
      findUnique: jest.fn(),
    },
    tourist: {
      findFirst: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('access-secret'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate and return employee if active employee is found (default userType)', async () => {
    const payload: JwtPayload = { sub: 'employee-uuid', role: Role.ADMIN, userType: 'EMPLOYEE' };
    const mockEmployee = {
      id: 'employee-uuid',
      email: 'admin@test.com',
      isActive: true,
      role: Role.ADMIN,
    };

    mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);

    const result = await strategy.validate(payload);

    expect(prisma.employee.findUnique).toHaveBeenCalledWith({
      where: { id: 'employee-uuid' },
    });
    expect(result).toEqual({ ...mockEmployee, userType: 'EMPLOYEE' });
  });

  it('should validate and return tourist if active tourist is found', async () => {
    const payload: JwtPayload = { sub: 'tourist-uuid', userType: 'TOURIST' };
    const mockTourist = {
      id: 'tourist-uuid',
      email: 'tourist@test.com',
      status: 'ACTIVE',
    };

    mockPrisma.tourist.findFirst.mockResolvedValue(mockTourist);

    const result = await strategy.validate(payload);

    expect(prisma.tourist.findFirst).toHaveBeenCalledWith({
      where: { id: 'tourist-uuid', deletedAt: null },
    });
    expect(result).toEqual({ ...mockTourist, userType: 'TOURIST' });
  });

  it('should throw UnauthorizedException if employee is not found', async () => {
    const payload: JwtPayload = { sub: 'nonexistent-uuid', role: Role.ADMIN, userType: 'EMPLOYEE' };
    mockPrisma.employee.findUnique.mockResolvedValue(null);

    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if tourist is not found', async () => {
    const payload: JwtPayload = { sub: 'nonexistent-uuid', userType: 'TOURIST' };
    mockPrisma.tourist.findFirst.mockResolvedValue(null);

    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if employee is inactive', async () => {
    const payload: JwtPayload = { sub: 'inactive-uuid', role: Role.ADMIN, userType: 'EMPLOYEE' };
    const mockEmployee = {
      id: 'inactive-uuid',
      email: 'inactive@test.com',
      isActive: false,
      role: Role.ADMIN,
    };

    mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);

    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if tourist is inactive', async () => {
    const payload: JwtPayload = { sub: 'inactive-uuid', userType: 'TOURIST' };
    const mockTourist = {
      id: 'inactive-uuid',
      email: 'inactive-tourist@test.com',
      status: 'INACTIVE',
    };

    mockPrisma.tourist.findFirst.mockResolvedValue(mockTourist);

    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });
});
