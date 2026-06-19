import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { IsEnum, IsIn, IsOptional, IsUUID } from 'class-validator';
import { TripStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TripQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: TripStatus,
    description: 'Filter by trip status',
  })
  @IsOptional()
  @IsEnum(TripStatus)
  status?: TripStatus;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Filter by destination ID',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  destinationId?: string;

  @ApiPropertyOptional({
    enum: [
      'id',
      'name',
      'startDate',
      'endDate',
      'status',
      'createdAt',
      'updatedAt',
    ],
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn([
    'id',
    'name',
    'startDate',
    'endDate',
    'status',
    'createdAt',
    'updatedAt',
  ])
  sortBy?:
    | 'id'
    | 'name'
    | 'startDate'
    | 'endDate'
    | 'status'
    | 'createdAt'
    | 'updatedAt' = 'createdAt';
}
