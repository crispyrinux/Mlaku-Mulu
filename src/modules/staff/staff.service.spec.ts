import { Test, TestingModule } from '@nestjs/testing';
import { StaffService } from './staff.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../../common/security/password.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Role, Gender } from '@prisma/client';

describe('StaffService', () => {
  let service: StaffService;
  let prisma: PrismaService;
  let passwordService: PasswordService;

  const mockPrisma = {
    employee: {
      findFirst: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockPasswordService = {
    hash: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PasswordService, useValue: mockPasswordService },
      ],
    }).compile();

    service = module.get<StaffService>(StaffService);
    prisma = module.get<PrismaService>(PrismaService);
    passwordService = module.get<PasswordService>(PasswordService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a staff successfully', async () => {
      const createDto = {
        fullName: 'Jane Doe',
        email: 'jane@test.com',
        password: 'password123',
        birthDate: '1995-05-15',
        gender: Gender.FEMALE,
        nationality: 'Indonesian',
        passportNumber: 'A1234567',
      };

      mockPrisma.employee.findFirst.mockResolvedValue(null);
      mockPasswordService.hash.mockResolvedValue('hashed-pass');
      mockPrisma.employee.create.mockResolvedValue({
        id: 'employee-uuid',
        ...createDto,
        birthDate: new Date(createDto.birthDate),
        password: 'hashed-pass',
        role: Role.STAFF,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(createDto);

      expect(prisma.employee.findFirst).toHaveBeenCalled();
      expect(passwordService.hash).toHaveBeenCalledWith('password123');
      expect(prisma.employee.create).toHaveBeenCalled();
      expect(result.id).toBe('employee-uuid');
      expect(result.email).toBe('jane@test.com');
    });

    it('should throw BadRequestException if email already exists', async () => {
      const createDto = {
        fullName: 'Jane Doe',
        email: 'jane@test.com',
        password: 'password123',
        birthDate: '1995-05-15',
        gender: Gender.FEMALE,
        nationality: 'Indonesian',
        passportNumber: 'A1234567',
      };

      mockPrisma.employee.findFirst.mockResolvedValue({ id: 'existing-id' });

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated list of employees', async () => {
      const query = { page: 1, limit: 10 };
      const employees = [
        {
          id: '1',
          fullName: 'Jane Doe',
          email: 'jane@test.com',
          role: Role.STAFF,
          isActive: true,
          birthDate: new Date(),
          gender: Gender.FEMALE,
          nationality: 'Indonesian',
          passportNumber: 'A1234567',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.employee.count.mockResolvedValue(1);
      mockPrisma.employee.findMany.mockResolvedValue(employees);

      const result = await service.findAll(query);

      expect(prisma.employee.count).toHaveBeenCalled();
      expect(prisma.employee.findMany).toHaveBeenCalled();
      expect(result.data.length).toBe(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('softDelete', () => {
    it('should mark employee as deleted by setting deletedAt', async () => {
      const employeeId = 'employee-uuid';
      mockPrisma.employee.findFirst.mockResolvedValue({ id: employeeId, deletedAt: null });

      await service.softDelete(employeeId);

      expect(prisma.employee.findFirst).toHaveBeenCalledWith({
        where: { id: employeeId, deletedAt: null },
      });
      expect(prisma.employee.update).toHaveBeenCalledWith({
        where: { id: employeeId },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw NotFoundException if employee to delete does not exist', async () => {
      const employeeId = 'nonexistent-uuid';
      mockPrisma.employee.findFirst.mockResolvedValue(null);

      await expect(service.softDelete(employeeId)).rejects.toThrow(NotFoundException);
    });
  });
});
