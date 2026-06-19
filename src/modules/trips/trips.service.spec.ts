import { Test, TestingModule } from '@nestjs/testing';
import { TripsService } from './trips.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { TripStatus } from '@prisma/client';

describe('TripsService', () => {
  let service: TripsService;
  let prisma: PrismaService;

  const mockPrisma = {
    destination: {
      findFirst: jest.fn(),
    },
    trip: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TripsService>(TripsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a trip successfully if destination exists', async () => {
      const createDto = {
        name: 'Summer Vacation',
        description: 'Trip to Bali',
        destinationId: 'dest-uuid',
        startDate: '2026-07-01',
        endDate: '2026-07-10',
        status: TripStatus.DRAFT,
      };

      mockPrisma.destination.findFirst.mockResolvedValue({ id: 'dest-uuid' });
      mockPrisma.trip.create.mockResolvedValue({
        id: 'trip-uuid',
        ...createDto,
        startDate: new Date(createDto.startDate),
        endDate: new Date(createDto.endDate),
      });

      const result = await service.create(createDto);

      expect(prisma.destination.findFirst).toHaveBeenCalledWith({
        where: { id: 'dest-uuid', deletedAt: null },
      });
      expect(prisma.trip.create).toHaveBeenCalled();
      expect(result.id).toBe('trip-uuid');
    });

    it('should throw NotFoundException if destination does not exist', async () => {
      const createDto = {
        name: 'Summer Vacation',
        description: 'Trip to Bali',
        destinationId: 'nonexistent-dest',
        startDate: '2026-07-01',
        endDate: '2026-07-10',
      };

      mockPrisma.destination.findFirst.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a trip successfully', async () => {
      const updateDto = {
        name: 'Updated Summer Vacation',
      };
      const tripId = 'trip-uuid';

      mockPrisma.trip.findFirst.mockResolvedValue({ id: tripId, deletedAt: null });
      mockPrisma.trip.update.mockResolvedValue({
        id: tripId,
        name: 'Updated Summer Vacation',
      });

      const result = await service.update(tripId, updateDto);

      expect(prisma.trip.findFirst).toHaveBeenCalledWith({
        where: { id: tripId, deletedAt: null },
      });
      expect(prisma.trip.update).toHaveBeenCalled();
      expect(result.name).toBe('Updated Summer Vacation');
    });

    it('should throw NotFoundException if trip is not found', async () => {
      mockPrisma.trip.findFirst.mockResolvedValue(null);

      await expect(service.update('nonexistent-trip', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    it('should set deletedAt date on soft delete', async () => {
      const tripId = 'trip-uuid';

      mockPrisma.trip.findFirst.mockResolvedValue({ id: tripId, deletedAt: null });

      await service.softDelete(tripId);

      expect(prisma.trip.findFirst).toHaveBeenCalledWith({
        where: { id: tripId, deletedAt: null },
      });
      expect(prisma.trip.update).toHaveBeenCalledWith({
        where: { id: tripId },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should throw NotFoundException if trip is not found', async () => {
      mockPrisma.trip.findFirst.mockResolvedValue(null);

      await expect(service.softDelete('nonexistent-trip')).rejects.toThrow(NotFoundException);
    });
  });
});
