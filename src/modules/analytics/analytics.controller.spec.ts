import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AdminAnalyticsResponseDto } from './dto/admin-analytics.dto';
import { StaffAnalyticsResponseDto } from './dto/staff-analytics.dto';
import { TouristAnalyticsResponseDto } from './dto/tourist-analytics.dto';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  const mockAnalyticsService = {
    getAdminDashboard: jest.fn(),
    getStaffDashboard: jest.fn(),
    getTouristDashboard: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        { provide: AnalyticsService, useValue: mockAnalyticsService },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAdminDashboard', () => {
    it('should call getAdminDashboard on the service and return the result', async () => {
      const mockResult: AdminAnalyticsResponseDto = {
        summary: {
          totalTourists: 5,
          totalEmployees: 2,
          totalDestinations: 3,
          totalTrips: 4,
        },
        visaStatusDistribution: [],
        nationalityDistribution: [],
        genderDistribution: [],
        statusDistribution: [],
        topStaffWorkload: [],
      };

      mockAnalyticsService.getAdminDashboard.mockResolvedValue(mockResult);

      const result = await controller.getAdminDashboard();

      expect(service.getAdminDashboard).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getStaffDashboard', () => {
    it('should call getStaffDashboard on the service and return the result', async () => {
      const employee = { id: 'staff-123' };
      const mockResult: StaffAnalyticsResponseDto = {
        summary: {
          totalAssignedTourists: 5,
          totalVisaApplicationsProcessed: 3,
          activeTripsManaged: 1,
        },
        upcomingTrips: [],
        recentVisaApplications: [],
      };

      mockAnalyticsService.getStaffDashboard.mockResolvedValue(mockResult);

      const result = await controller.getStaffDashboard(Staff);

      expect(service.getStaffDashboard).toHaveBeenCalledTimes(1);
      expect(service.getStaffDashboard).toHaveBeenCalledWith('staff-123');
      expect(result).toEqual(mockResult);
    });
  });

  describe('getTouristDashboard', () => {
    it('should call getTouristDashboard on the service and return the result', async () => {
      const tourist = { id: 'tourist-456' };
      const mockResult: TouristAnalyticsResponseDto = {
        passportAlert: {
          passportNumber: 'PS-123',
          daysUntilExpiry: 30,
          expiryDate: new Date(),
        },
        tripStats: {
          completedTripsCount: 2,
          upcomingTripsCount: 1,
          ongoingTripsCount: 0,
        },
        latestVisaApplication: null,
      };

      mockAnalyticsService.getTouristDashboard.mockResolvedValue(mockResult);

      const result = await controller.getTouristDashboard(tourist);

      expect(service.getTouristDashboard).toHaveBeenCalledTimes(1);
      expect(service.getTouristDashboard).toHaveBeenCalledWith('tourist-456');
      expect(result).toEqual(mockResult);
    });
  });
});
