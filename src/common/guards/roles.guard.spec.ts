import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockExecutionContext = (user?: any): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if no roles are required', () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);

    const context = mockExecutionContext();
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should return true if user role is included in required roles', () => {
    mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN, Role.SUPER_ADMIN]);

    const context = mockExecutionContext({ role: Role.ADMIN });
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if user is missing', () => {
    mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    const context = mockExecutionContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user role is missing', () => {
    mockReflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    const context = mockExecutionContext({ id: 'some-id' });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if user role is not allowed', () => {
    mockReflector.getAllAndOverride.mockReturnValue([Role.SUPER_ADMIN]);

    const context = mockExecutionContext({ role: Role.STAFF });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow SUPER_ADMIN access if SUPER_ADMIN is in required roles', () => {
    mockReflector.getAllAndOverride.mockReturnValue([Role.SUPER_ADMIN, Role.ADMIN]);

    const context = mockExecutionContext({ role: Role.SUPER_ADMIN });
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });
});
