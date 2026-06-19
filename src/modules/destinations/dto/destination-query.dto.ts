import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class DestinationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by country',
    example: 'Indonesia',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    enum: ['id', 'name', 'country', 'city', 'createdAt', 'updatedAt'],
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['id', 'name', 'country', 'city', 'createdAt', 'updatedAt'])
  sortBy?: string = 'createdAt';
}
