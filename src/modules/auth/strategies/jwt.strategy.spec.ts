import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: PrismaService;

  const mockPrisma = {
    employee: {
      findUnique: jest.fn(),
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

  it('should validate and return employee if active employee is found', async () => {
    const payload = { sub: 'employee-uuid', role: Role.ADMIN };
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
    expect(result).toEqual(mockEmployee);
  });

  it('should throw UnauthorizedException if employee is not found', async () => {
    const payload = { sub: 'nonexistent-uuid', role: Role.ADMIN };
    mockPrisma.employee.findUnique.mockResolvedValue(null);

    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if employee is inactive', async () => {
    const payload = { sub: 'inactive-uuid', role: Role.ADMIN };
    const mockEmployee = {
      id: 'inactive-uuid',
      email: 'inactive@test.com',
      isActive: false,
      role: Role.ADMIN,
    };

    mockPrisma.employee.findUnique.mockResolvedValue(mockEmployee);

    await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
  });
});
