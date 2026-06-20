import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Role, Gender } from '@prisma/client';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;

  const mockPrisma = {
    tourist: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    employee: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    destination: {
      count: jest.fn(),
    },
    trip: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    visaApplication: {
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
      findFirst: jest.fn(),
    },
    assignment: {
      count: jest.fn(),
    },
    passport: {
      findUnique: jest.fn(),
    },
    tripParticipant: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAdminDashboard', () => {
    it('should return aggregated admin analytics successfully', async () => {
      // Mock counts
      mockPrisma.tourist.count.mockResolvedValue(100);
      mockPrisma.employee.count.mockResolvedValue(10);
      mockPrisma.destination.count.mockResolvedValue(15);
      mockPrisma.trip.count.mockResolvedValue(20);

      // Mock visa applications groupby
      mockPrisma.visaApplication.groupBy.mockResolvedValue([
        { status: 'APPROVED', _count: { _all: 30 } },
        { status: 'PENDING', _count: { _all: 5 } },
      ]);

      // Mock tourist nationality groupby
      mockPrisma.tourist.groupBy.mockImplementation(async (args) => {
        if (args.by.includes('nationality')) {
          return [
            { nationality: 'Indonesia', _count: { _all: 80 } },
            { nationality: 'Malaysia', _count: { _all: 20 } },
          ];
        }
        if (args.by.includes('gender')) {
          return [
            { gender: Gender.MALE, _count: { _all: 60 } },
            { gender: Gender.FEMALE, _count: { _all: 40 } },
          ];
        }
        if (args.by.includes('status')) {
          return [
            { status: 'ACTIVE', _count: { _all: 95 } },
            { status: 'BLACKLISTED', _count: { _all: 5 } },
          ];
        }
        return [];
      });

      // Mock top employees findMany
      mockPrisma.employee.findMany.mockResolvedValue([
        {
          id: 'staff-1',
          fullName: 'Staff One',
          email: 'staff1@test.com',
          _count: { assignments: 8 },
        },
        {
          id: 'staff-2',
          fullName: 'Staff Two',
          email: 'staff2@test.com',
          _count: { assignments: 5 },
        },
      ]);

      const result = await service.getAdminDashboard();

      expect(result).toBeDefined();
      expect(result.summary.totalTourists).toBe(100);
      expect(result.summary.totalEmployees).toBe(10);
      expect(result.summary.totalDestinations).toBe(15);
      expect(result.summary.totalTrips).toBe(20);

      expect(result.visaStatusDistribution).toHaveLength(2);
      expect(result.visaStatusDistribution[0]).toEqual({ status: 'APPROVED', count: 30 });

      expect(result.nationalityDistribution).toHaveLength(2);
      expect(result.nationalityDistribution[0]).toEqual({ nationality: 'Indonesia', count: 80 });

      expect(result.genderDistribution).toHaveLength(2);
      expect(result.genderDistribution[0]).toEqual({ gender: Gender.MALE, count: 60 });

      expect(result.statusDistribution).toHaveLength(2);
      expect(result.statusDistribution[0]).toEqual({ status: 'ACTIVE', count: 95 });

      expect(result.topStaffWorkload).toHaveLength(2);
      expect(result.topStaffWorkload[0]).toEqual({
        id: 'staff-1',
        fullName: 'Staff One',
        email: 'staff1@test.com',
        assignedTouristsCount: 8,
      });
    });
  });

  describe('getStaffDashboard', () => {
    it('should return aggregated staff metrics successfully', async () => {
      const employeeId = 'staff-uuid';

      // 1. Mock summary counts
      mockPrisma.assignment.count.mockResolvedValue(10);
      mockPrisma.visaApplication.count.mockResolvedValue(5);
      mockPrisma.trip.count.mockResolvedValue(2);

      // 2. Mock upcoming trips
      mockPrisma.trip.findMany.mockResolvedValue([
        {
          id: 'trip-1',
          name: 'Bali Trip',
          startDate: new Date('2026-07-01'),
          endDate: new Date('2026-07-05'),
          destination: { city: 'Denpasar' },
          tripParticipants: [
            {
              tourist: {
                id: 'tourist-1',
                fullName: 'Alice',
              },
            },
          ],
        },
      ]);

      // 3. Mock recent visa applications
      mockPrisma.visaApplication.findMany.mockResolvedValue([
        {
          applicationNumber: 'VISA-101',
          country: 'Singapore',
          visaType: 'Social Visit',
          status: 'APPROVED',
          updatedAt: new Date('2026-06-20'),
          tourist: {
            id: 'tourist-1',
            fullName: 'Alice',
          },
        },
      ]);

      const result = await service.getStaffDashboard(employeeId);

      expect(result).toBeDefined();
      expect(result.summary.totalAssignedTourists).toBe(10);
      expect(result.summary.totalVisaApplicationsProcessed).toBe(5);
      expect(result.summary.activeTripsManaged).toBe(2);

      expect(result.upcomingTrips).toHaveLength(1);
      expect(result.upcomingTrips[0].name).toBe('Bali Trip');
      expect(result.upcomingTrips[0].destinationCity).toBe('Denpasar');
      expect(result.upcomingTrips[0].participatingTourists).toHaveLength(1);
      expect(result.upcomingTrips[0].participatingTourists[0].fullName).toBe('Alice');

      expect(result.recentVisaApplications).toHaveLength(1);
      expect(result.recentVisaApplications[0].applicationNumber).toBe('VISA-101');
      expect(result.recentVisaApplications[0].tourist.fullName).toBe('Alice');

      // Verify that queries targeted the correct employee ID
      expect(mockPrisma.assignment.count).toHaveBeenCalledWith({
        where: { employeeId },
      });
      expect(mockPrisma.visaApplication.count).toHaveBeenCalledWith({
        where: { createdByEmployeeId: employeeId, deletedAt: null },
      });
    });
  });

  describe('getTouristDashboard', () => {
    it('should return aggregated tourist metrics successfully', async () => {
      const touristId = 'tourist-uuid';
      const mockExpiryDate = new Date();
      mockExpiryDate.setDate(mockExpiryDate.getDate() + 90); // 90 days from now

      // 1. Mock passport details
      mockPrisma.passport.findUnique.mockResolvedValue({
        passportNumber: 'TOUR-9900',
        expiryDate: mockExpiryDate,
      });

      // 2. Mock trip participant records
      mockPrisma.tripParticipant.findMany.mockResolvedValue([
        { trip: { status: 'COMPLETED' } },
        { trip: { status: 'COMPLETED' } },
        { trip: { status: 'UPCOMING' } },
      ]);

      // 3. Mock latest visa application details
      mockPrisma.visaApplication.findFirst.mockResolvedValue({
        applicationNumber: 'VISA-AU-889',
        country: 'Australia',
        visaType: 'Visitor',
        status: 'SUBMITTED',
        updatedAt: new Date('2026-06-18'),
      });

      const result = await service.getTouristDashboard(touristId);

      expect(result).toBeDefined();
      expect(result.passportAlert).toBeDefined();
      expect(result.passportAlert?.passportNumber).toBe('TOUR-9900');
      expect(result.passportAlert?.daysUntilExpiry).toBe(90);

      expect(result.tripStats.completedTripsCount).toBe(2);
      expect(result.tripStats.upcomingTripsCount).toBe(1);
      expect(result.tripStats.ongoingTripsCount).toBe(0);

      expect(result.latestVisaApplication).toBeDefined();
      expect(result.latestVisaApplication?.applicationNumber).toBe('VISA-AU-889');
      expect(result.latestVisaApplication?.status).toBe('SUBMITTED');

      expect(mockPrisma.passport.findUnique).toHaveBeenCalledWith({
        where: { touristId },
        select: { passportNumber: true, expiryDate: true },
      });
      expect(mockPrisma.tripParticipant.findMany).toHaveBeenCalledWith({
        where: { touristId },
        include: { trip: { select: { status: true } } },
      });
      expect(mockPrisma.visaApplication.findFirst).toHaveBeenCalledWith({
        where: { touristId, deletedAt: null },
        orderBy: { updatedAt: 'desc' },
        select: {
          applicationNumber: true,
          country: true,
          visaType: true,
          status: true,
          updatedAt: true,
        },
      });
    });
  });
});

