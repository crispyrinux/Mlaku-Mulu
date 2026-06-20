import { ApiProperty } from '@nestjs/swagger';

export class TouristPassportAlertDto {
  @ApiProperty({ example: 'PS-123456', description: 'Passport number' })
  passportNumber: string;

  @ApiProperty({ example: 180, description: 'Days until passport expires (negative if already expired)', nullable: true })
  daysUntilExpiry: number | null;

  @ApiProperty({ example: '2026-12-20T00:00:00.000Z', description: 'Passport expiry date', nullable: true })
  expiryDate: Date | null;
}

export class TouristTripStatsDto {
  @ApiProperty({ example: 3, description: 'Number of completed trips' })
  completedTripsCount: number;

  @ApiProperty({ example: 1, description: 'Number of upcoming trips' })
  upcomingTripsCount: number;

  @ApiProperty({ example: 0, description: 'Number of ongoing trips' })
  ongoingTripsCount: number;
}

export class TouristActiveVisaDto {
  @ApiProperty({ example: 'visa-12345', description: 'Visa application number' })
  applicationNumber: string;

  @ApiProperty({ example: 'Australia', description: 'Visa country' })
  country: string;

  @ApiProperty({ example: 'Subclass 600', description: 'Visa type' })
  visaType: string;

  @ApiProperty({ example: 'IN_REVIEW', description: 'Current visa application status' })
  status: string;

  @ApiProperty({ example: '2026-06-20T10:00:00.000Z', description: 'Last status update time' })
  updatedAt: Date;
}

export class TouristAnalyticsResponseDto {
  @ApiProperty({ type: TouristPassportAlertDto, description: 'Passport status and alert details', nullable: true })
  passportAlert: TouristPassportAlertDto | null;

  @ApiProperty({ type: TouristTripStatsDto, description: 'Trip statistics summary' })
  tripStats: TouristTripStatsDto;

  @ApiProperty({ type: TouristActiveVisaDto, description: 'Latest active visa application', nullable: true })
  latestVisaApplication: TouristActiveVisaDto | null;
}
