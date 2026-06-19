import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreatePassportDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  touristId: string;

  @ApiProperty({ example: 'A12345678' })
  @IsString()
  @IsNotEmpty()
  passportNumber: string;

  @ApiPropertyOptional({ example: '2020-01-15', type: String, format: 'date' })
  @IsDateString()
  @IsOptional()
  issueDate?: string;

  @ApiPropertyOptional({ example: '2030-01-15', type: String, format: 'date' })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @ApiPropertyOptional({ example: 'New York, USA' })
  @IsString()
  @IsOptional()
  placeOfIssue?: string;
}
