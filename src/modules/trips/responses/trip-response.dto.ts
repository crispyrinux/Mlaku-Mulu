import { ApiProperty } from '@nestjs/swagger';
import { TripStatus } from '@prisma/client';

export class TripResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  destinationId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: String, format: 'date-time' })
  startDate: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  endDate: Date;

  @ApiProperty({ enum: TripStatus })
  status: TripStatus;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}
