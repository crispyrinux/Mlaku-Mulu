import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TripStatus } from '@prisma/client';

export class CreateTripDto {
  @ApiProperty({ example: 'Bali Adventure Trip' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'A wonderful trip to explore the beauty of Bali' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  destinationId: string;

  @ApiProperty({
    example: '2026-07-01T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    example: '2026-07-07T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({
    enum: TripStatus,
    example: TripStatus.DRAFT,
    default: TripStatus.DRAFT,
  })
  @IsEnum(TripStatus)
  @IsOptional()
  status?: TripStatus = TripStatus.DRAFT;
}
