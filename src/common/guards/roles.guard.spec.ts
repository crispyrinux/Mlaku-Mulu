import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { USER_TYPES_KEY } from '../decorators/user-types.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  let userTypesMetadata: any = undefined;
  let rolesMetadata: any = undefined;

  const mockReflector = {
    getAllAndOverride: jest.fn((key) => {
      if (key === USER_TYPES_KEY) {
        return userTypesMetadata;
      }
      if (key === ROLES_KEY) {
        return rolesMetadata;
      }
      return undefined;
    }),
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

    userTypesMetadata = undefined;
    rolesMetadata = undefined;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if no user types or roles are required (default to EMPLOYEE)', () => {
    const context = mockExecutionContext({ role: Role.STAFF, userType: 'EMPLOYEE' });
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should return true if user role is included in required roles', () => {
    rolesMetadata = [Role.ADMIN, Role.SUPER_ADMIN];

    const context = mockExecutionContext({ role: Role.ADMIN, userType: 'EMPLOYEE' });
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should throw ForbiddenException if user is missing', () => {
    rolesMetadata = [Role.ADMIN];

    const context = mockExecutionContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if employee user role is missing', () => {
    rolesMetadata = [Role.ADMIN];

    const context = mockExecutionContext({ id: 'some-id', userType: 'EMPLOYEE' });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw ForbiddenException if employee user role is not allowed', () => {
    rolesMetadata = [Role.SUPER_ADMIN];

    const context = mockExecutionContext({ role: Role.STAFF, userType: 'EMPLOYEE' });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow SUPER_ADMIN access if SUPER_ADMIN is in required roles', () => {
    rolesMetadata = [Role.SUPER_ADMIN, Role.ADMIN];

    const context = mockExecutionContext({ role: Role.SUPER_ADMIN, userType: 'EMPLOYEE' });
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should allow TOURIST access if allowedUserTypes includes TOURIST', () => {
    userTypesMetadata = ['TOURIST'];

    const context = mockExecutionContext({ id: 'tourist-uuid', userType: 'TOURIST' });
    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('should block TOURIST access if allowedUserTypes does not include TOURIST', () => {
    userTypesMetadata = ['EMPLOYEE'];

    const context = mockExecutionContext({ id: 'tourist-uuid', userType: 'TOURIST' });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
