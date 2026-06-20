import { ApiProperty } from '@nestjs/swagger';

export class SummaryCardsDto {
  @ApiProperty({ example: 120, description: 'Total number of tourists' })
  totalTourists: number;

  @ApiProperty({ example: 15, description: 'Total number of employees' })
  totalEmployees: number;

  @ApiProperty({ example: 45, description: 'Total number of destinations' })
  totalDestinations: number;

  @ApiProperty({ example: 30, description: 'Total number of trips' })
  totalTrips: number;
}

export class VisaStatusDistributionDto {
  @ApiProperty({ example: 'APPROVED', description: 'Visa application status' })
  status: string;

  @ApiProperty({ example: 25, description: 'Number of applications with this status' })
  count: number;
}

export class NationalityDistributionDto {
  @ApiProperty({ example: 'Indonesia', description: 'Nationality name' })
  nationality: string;

  @ApiProperty({ example: 85, description: 'Number of tourists from this nationality' })
  count: number;
}

export class GenderDistributionDto {
  @ApiProperty({ example: 'MALE', description: 'Gender value' })
  gender: string;

  @ApiProperty({ example: 60, description: 'Number of tourists with this gender' })
  count: number;
}

export class TouristStatusDistributionDto {
  @ApiProperty({ example: 'ACTIVE', description: 'Tourist account status' })
  status: string;

  @ApiProperty({ example: 110, description: 'Number of tourists with this status' })
  count: number;
}

export class StaffWorkloadDto {
  @ApiProperty({ example: 'e7137f8d-4a8b-402a-96c2-480cb1fefad7', description: 'Employee ID' })
  id: string;

  @ApiProperty({ example: 'Jane Doe', description: 'Full name of the employee' })
  fullName: string;

  @ApiProperty({ example: 'jane.doe@example.com', description: 'Email address of the employee' })
  email: string;

  @ApiProperty({ example: 8, description: 'Number of assigned tourists (workload)' })
  assignedTouristsCount: number;
}

export class AdminAnalyticsResponseDto {
  @ApiProperty({ type: SummaryCardsDto, description: 'General summary counts' })
  summary: SummaryCardsDto;

  @ApiProperty({ type: [VisaStatusDistributionDto], description: 'Visa application distribution by status' })
  visaStatusDistribution: VisaStatusDistributionDto[];

  @ApiProperty({ type: [NationalityDistributionDto], description: 'Tourist distribution by nationality' })
  nationalityDistribution: NationalityDistributionDto[];

  @ApiProperty({ type: [GenderDistributionDto], description: 'Tourist distribution by gender' })
  genderDistribution: GenderDistributionDto[];

  @ApiProperty({ type: [TouristStatusDistributionDto], description: 'Tourist distribution by status' })
  statusDistribution: TouristStatusDistributionDto[];

  @ApiProperty({ type: [StaffWorkloadDto], description: 'Top 5 Staff by workload' })
  topStaffWorkload: StaffWorkloadDto[];
}
