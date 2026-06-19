import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class EmployeeQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ['id', 'fullName', 'email', 'createdAt', 'updatedAt'],
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['id', 'fullName', 'email', 'createdAt', 'updatedAt'])
  sortBy?: 'id' | 'fullName' | 'email' | 'createdAt' | 'updatedAt' =
    'createdAt';
}
