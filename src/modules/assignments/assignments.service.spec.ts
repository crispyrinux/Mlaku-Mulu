import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentsService } from './assignments.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('AssignmentsService', () => {
  let service: AssignmentsService;
  let prisma: PrismaService;

  const mockPrisma = {
    employee: {
      findUnique: jest.fn(),
    },
    tourist: {
      findUnique: jest.fn(),
    },
    assignment: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AssignmentsService>(AssignmentsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create an assignment successfully if employee and tourist exist', async () => {
      const createDto = {
        employeeId: 'emp-uuid',
        touristId: 'tourist-uuid',
      };

      mockPrisma.employee.findUnique.mockResolvedValue({ id: 'emp-uuid' });
      mockPrisma.tourist.findUnique.mockResolvedValue({ id: 'tourist-uuid' });
      mockPrisma.assignment.create.mockResolvedValue({
        id: 'assignment-uuid',
        employeeId: 'emp-uuid',
        touristId: 'tourist-uuid',
      });

      const result = await service.create(createDto);

      expect(prisma.employee.findUnique).toHaveBeenCalledWith({ where: { id: 'emp-uuid' } });
      expect(prisma.tourist.findUnique).toHaveBeenCalledWith({ where: { id: 'tourist-uuid' } });
      expect(prisma.assignment.create).toHaveBeenCalled();
      expect(result.id).toBe('assignment-uuid');
    });

    it('should throw NotFoundException if employee does not exist', async () => {
      const createDto = {
        employeeId: 'nonexistent-emp',
        touristId: 'tourist-uuid',
      };

      mockPrisma.employee.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if tourist does not exist', async () => {
      const createDto = {
        employeeId: 'emp-uuid',
        touristId: 'nonexistent-tourist',
      };

      mockPrisma.employee.findUnique.mockResolvedValue({ id: 'emp-uuid' });
      mockPrisma.tourist.findUnique.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });

    it('should handle duplicate assignment unique constraint database error', async () => {
      const createDto = {
        employeeId: 'emp-uuid',
        touristId: 'tourist-uuid',
      };

      mockPrisma.employee.findUnique.mockResolvedValue({ id: 'emp-uuid' });
      mockPrisma.tourist.findUnique.mockResolvedValue({ id: 'tourist-uuid' });
      
      const prismaError = new Error('Unique constraint failed');
      (prismaError as any).code = 'P2002';
      mockPrisma.assignment.create.mockRejectedValue(prismaError);

      await expect(service.create(createDto)).rejects.toThrow('Unique constraint failed');
    });
  });

  describe('remove', () => {
    it('should delete an assignment successfully if it exists', async () => {
      const assignmentId = 'assign-uuid';

      mockPrisma.assignment.findUnique.mockResolvedValue({ id: assignmentId });

      await service.remove(assignmentId);

      expect(prisma.assignment.findUnique).toHaveBeenCalledWith({ where: { id: assignmentId } });
      expect(prisma.assignment.delete).toHaveBeenCalledWith({ where: { id: assignmentId } });
    });

    it('should throw NotFoundException if assignment to delete is not found', async () => {
      mockPrisma.assignment.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent-uuid')).rejects.toThrow(NotFoundException);
    });
  });
});
