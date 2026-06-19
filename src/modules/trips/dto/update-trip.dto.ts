import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { TripStatus } from '@prisma/client';

export class UpdateTripDto {
  @ApiPropertyOptional({ example: 'Updated Trip Name' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated trip description' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  destinationId?: string;

  @ApiPropertyOptional({
    example: '2026-08-01T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-08-07T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    enum: TripStatus,
    example: TripStatus.UPCOMING,
  })
  @IsEnum(TripStatus)
  @IsOptional()
  status?: TripStatus;
}
