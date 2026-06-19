import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdatePassportDto {
  @ApiPropertyOptional({ example: '2021-06-01', type: String, format: 'date' })
  @IsDateString()
  @IsOptional()
  issueDate?: string;

  @ApiPropertyOptional({ example: '2031-06-01', type: String, format: 'date' })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @ApiPropertyOptional({ example: 'London, UK' })
  @IsString()
  @IsOptional()
  placeOfIssue?: string;
}
