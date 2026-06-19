import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { VisaApplicationStatus } from '@prisma/client';

export class VisaApplicationQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10, minimum: 1, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Search by applicationNumber or tourist fullName',
    example: 'VA-2026',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: VisaApplicationStatus,
    description: 'Filter by visa application status',
  })
  @IsOptional()
  @IsEnum(VisaApplicationStatus)
  status?: VisaApplicationStatus;

  @ApiPropertyOptional({
    description: 'Filter by country',
    example: 'Japan',
  })
  @IsOptional()
  @IsString()
  country?: string;
}
