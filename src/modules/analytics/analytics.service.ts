import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';
import {
  AdminAnalyticsResponseDto,
  VisaStatusDistributionDto,
  NationalityDistributionDto,
  GenderDistributionDto,
  TouristStatusDistributionDto,
  StaffWorkloadDto,
} from './dto/admin-analytics.dto';
import {
  StaffAnalyticsResponseDto,
  StaffUpcomingTripDto,
  StaffRecentVisaApplicationDto,
} from './dto/staff-analytics.dto';
import {
  TouristAnalyticsResponseDto,
  TouristPassportAlertDto,
  TouristTripStatsDto,
  TouristActiveVisaDto,
} from './dto/tourist-analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAdminDashboard(): Promise<AdminAnalyticsResponseDto> {
    // 1. General counts (Summary)
    const [totalTourists, totalEmployees, totalDestinations, totalTrips] =
      await Promise.all([
        this.prisma.tourist.count({ where: { deletedAt: null } }),
        this.prisma.employee.count({ where: { deletedAt: null } }),
        this.prisma.destination.count({ where: { deletedAt: null } }),
        this.prisma.trip.count({ where: { deletedAt: null } }),
      ]);

    // 2. Visa application distribution by status
    const visaGroups = await this.prisma.visaApplication.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
      where: { deletedAt: null },
    });
    const visaStatusDistribution: VisaStatusDistributionDto[] = visaGroups.map(
      (g) => ({
        status: g.status,
        count: g._count._all,
      }),
    );

    // 3. Tourist distribution by nationality
    const nationalityGroups = await this.prisma.tourist.groupBy({
      by: ['nationality'],
      _count: {
        _all: true,
      },
      where: { deletedAt: null },
    });
    const nationalityDistribution: NationalityDistributionDto[] =
      nationalityGroups.map((g) => ({
        nationality: g.nationality,
        count: g._count._all,
      }));

    // 4. Tourist distribution by gender
    const genderGroups = await this.prisma.tourist.groupBy({
      by: ['gender'],
      _count: {
        _all: true,
      },
      where: { deletedAt: null },
    });
    const genderDistribution: GenderDistributionDto[] = genderGroups.map(
      (g) => ({
        gender: g.gender,
        count: g._count._all,
      }),
    );

    // 5. Tourist distribution by status
    const statusGroups = await this.prisma.tourist.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
      where: { deletedAt: null },
    });
    const statusDistribution: TouristStatusDistributionDto[] = statusGroups.map(
      (g) => ({
        status: g.status,
        count: g._count._all,
      }),
    );

    // 6. Top 5 staff by workload (assignments count)
    const topEmployees = await this.prisma.employee.findMany({
      where: {
        role: Role.STAFF,
        deletedAt: null,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        _count: {
          select: {
            assignments: true,
          },
        },
      },
      orderBy: {
        assignments: {
          _count: 'desc',
        },
      },
      take: 5,
    });
    const topStaffWorkload: StaffWorkloadDto[] = topEmployees.map((e) => ({
      id: e.id,
      fullName: e.fullName,
      email: e.email,
      assignedTouristsCount: e._count.assignments,
    }));

    return {
      summary: {
        totalTourists,
        totalEmployees,
        totalDestinations,
        totalTrips,
      },
      visaStatusDistribution,
      nationalityDistribution,
      genderDistribution,
      statusDistribution,
      topStaffWorkload,
    };
  }

  async getStaffDashboard(employeeId: string): Promise<StaffAnalyticsResponseDto> {
    // 1. General counts (Summary for Staff)
    const [totalAssignedTourists, totalVisaApplicationsProcessed, activeTripsManaged] =
      await Promise.all([
        // Number of assigned tourists
        this.prisma.assignment.count({
          where: { employeeId },
        }),
        // Number of visa applications created/processed
        this.prisma.visaApplication.count({
          where: { createdByEmployeeId: employeeId, deletedAt: null },
        }),
        // Ongoing trips involving the assigned tourists
        this.prisma.trip.count({
          where: {
            status: 'ONGOING',
            deletedAt: null,
            tripParticipants: {
              some: {
                tourist: {
                  assignments: {
                    some: {
                      employeeId,
                    },
                  },
                },
              },
            },
          },
        }),
      ]);

    // 2. Top 5 upcoming trips of assigned tourists
    const upcomingTripsRaw = await this.prisma.trip.findMany({
      where: {
        status: 'UPCOMING',
        deletedAt: null,
        tripParticipants: {
          some: {
            tourist: {
              assignments: {
                some: {
                  employeeId,
                },
              },
            },
          },
        },
      },
      include: {
        destination: true,
        tripParticipants: {
          where: {
            tourist: {
              assignments: {
                some: {
                  employeeId,
                },
              },
            },
          },
          include: {
            tourist: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
      take: 5,
    });

    const upcomingTrips: StaffUpcomingTripDto[] = upcomingTripsRaw.map((t) => ({
      id: t.id,
      name: t.name,
      startDate: t.startDate,
      endDate: t.endDate,
      destinationCity: t.destination.city,
      participatingTourists: t.tripParticipants.map((tp) => ({
        id: tp.tourist.id,
        fullName: tp.tourist.fullName,
      })),
    }));

    // 3. Top 5 recent visa applications processed by this staff
    const recentVisaApplicationsRaw = await this.prisma.visaApplication.findMany({
      where: {
        createdByEmployeeId: employeeId,
        deletedAt: null,
      },
      include: {
        tourist: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 5,
    });

    const recentVisaApplications: StaffRecentVisaApplicationDto[] = recentVisaApplicationsRaw.map((v) => ({
      applicationNumber: v.applicationNumber,
      country: v.country,
      visaType: v.visaType,
      status: v.status,
      updatedAt: v.updatedAt,
      tourist: {
        id: v.tourist.id,
        fullName: v.tourist.fullName,
      },
    }));

    return {
      summary: {
        totalAssignedTourists,
        totalVisaApplicationsProcessed,
        activeTripsManaged,
      },
      upcomingTrips,
      recentVisaApplications,
    };
  }

  async getTouristDashboard(touristId: string): Promise<TouristAnalyticsResponseDto> {
    // 1. Passport Expiry alert
    const passport = await this.prisma.passport.findUnique({
      where: { touristId },
      select: { passportNumber: true, expiryDate: true },
    });

    let passportAlert: TouristPassportAlertDto | null = null;
    if (passport) {
      let daysUntilExpiry: number | null = null;
      if (passport.expiryDate) {
        const diffTime = passport.expiryDate.getTime() - new Date().getTime();
        daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      passportAlert = {
        passportNumber: passport.passportNumber,
        daysUntilExpiry,
        expiryDate: passport.expiryDate,
      };
    }

    // 2. Trip Stats (Participant stats)
    const tripParticipants = await this.prisma.tripParticipant.findMany({
      where: { touristId },
      include: {
        trip: {
          select: {
            status: true,
          },
        },
      },
    });

    let completedTripsCount = 0;
    let upcomingTripsCount = 0;
    let ongoingTripsCount = 0;

    for (const tp of tripParticipants) {
      if (tp.trip.status === 'COMPLETED') {
        completedTripsCount++;
      } else if (tp.trip.status === 'UPCOMING') {
        upcomingTripsCount++;
      } else if (tp.trip.status === 'ONGOING') {
        ongoingTripsCount++;
      }
    }

    const tripStats: TouristTripStatsDto = {
      completedTripsCount,
      upcomingTripsCount,
      ongoingTripsCount,
    };

    // 3. Latest active/recent visa application
    const latestVisaRaw = await this.prisma.visaApplication.findFirst({
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

    const latestVisaApplication: TouristActiveVisaDto | null = latestVisaRaw
      ? {
          applicationNumber: latestVisaRaw.applicationNumber,
          country: latestVisaRaw.country,
          visaType: latestVisaRaw.visaType,
          status: latestVisaRaw.status,
          updatedAt: latestVisaRaw.updatedAt,
        }
      : null;

    return {
      passportAlert,
      tripStats,
      latestVisaApplication,
    };
  }
}


