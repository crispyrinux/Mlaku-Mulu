import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class AssignmentQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Filter by employee ID',
  })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Filter by tourist ID',
  })
  @IsOptional()
  @IsUUID()
  touristId?: string;

  @ApiPropertyOptional({
    enum: ['id', 'assignedAt'],
    example: 'assignedAt',
    default: 'assignedAt',
  })
  @IsOptional()
  @IsIn(['id', 'assignedAt'])
  sortBy?: 'id' | 'assignedAt' = 'assignedAt';
}
