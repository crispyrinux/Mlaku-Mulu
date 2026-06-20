import { ApiProperty } from '@nestjs/swagger';

export class StaffSummaryDto {
  @ApiProperty({ example: 12, description: 'Total number of tourists assigned to this staff' })
  totalAssignedTourists: number;

  @ApiProperty({ example: 8, description: 'Total number of visa applications submitted/processed by this staff' })
  totalVisaApplicationsProcessed: number;

  @ApiProperty({ example: 2, description: 'Total number of ongoing trips managed for assigned tourists' })
  activeTripsManaged: number;
}

export class AssignedTouristMinDto {
  @ApiProperty({ example: 'd3b07384-d113-4a12-a5b6-764cb3fef2a8', description: 'Tourist ID' })
  id: string;

  @ApiProperty({ example: 'Alice Smith', description: 'Full name of the tourist' })
  fullName: string;
}

export class StaffUpcomingTripDto {
  @ApiProperty({ example: 'b1a23f7d-2b8c-403a-a1b9-383cb1fef123', description: 'Trip ID' })
  id: string;

  @ApiProperty({ example: 'Summer Holiday Bali', description: 'Trip Name' })
  name: string;

  @ApiProperty({ example: '2026-07-01T00:00:00.000Z', description: 'Trip start date' })
  startDate: Date;

  @ApiProperty({ example: '2026-07-10T00:00:00.000Z', description: 'Trip end date' })
  endDate: Date;

  @ApiProperty({ example: 'Bali', description: 'Destination city' })
  destinationCity: string;

  @ApiProperty({ type: [AssignedTouristMinDto], description: 'Assigned tourists participating in this trip' })
  participatingTourists: AssignedTouristMinDto[];
}

export class StaffRecentVisaApplicationDto {
  @ApiProperty({ example: 'visa-899201', description: 'Visa application number' })
  applicationNumber: string;

  @ApiProperty({ example: 'Japan', description: 'Visa destination country' })
  country: string;

  @ApiProperty({ example: 'Tourist Visa', description: 'Visa type' })
  visaType: string;

  @ApiProperty({ example: 'SUBMITTED', description: 'Visa application status' })
  status: string;

  @ApiProperty({ example: '2026-06-19T10:00:00.000Z', description: 'Last update time' })
  updatedAt: Date;

  @ApiProperty({ type: AssignedTouristMinDto, description: 'Tourist details' })
  tourist: AssignedTouristMinDto;
}

export class StaffAnalyticsResponseDto {
  @ApiProperty({ type: StaffSummaryDto, description: 'Summary statistics' })
  summary: StaffSummaryDto;

  @ApiProperty({ type: [StaffUpcomingTripDto], description: 'Top 5 upcoming trips involving assigned tourists' })
  upcomingTrips: StaffUpcomingTripDto[];

  @ApiProperty({ type: [StaffRecentVisaApplicationDto], description: 'Top 5 recent visa applications processed' })
  recentVisaApplications: StaffRecentVisaApplicationDto[];
}
