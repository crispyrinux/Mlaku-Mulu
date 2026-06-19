import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { IsEnum, IsIn, IsOptional } from 'class-validator';
import { TouristStatus } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TouristQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: TouristStatus,
    description: 'Filter by tourist status',
  })
  @IsOptional()
  @IsEnum(TouristStatus)
  status?: TouristStatus;

  @ApiPropertyOptional({
    enum: ['id', 'fullName', 'createdAt', 'updatedAt'],
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['id', 'fullName', 'createdAt', 'updatedAt'])
  sortBy?: 'id' | 'fullName' | 'createdAt' | 'updatedAt' = 'createdAt';
}
