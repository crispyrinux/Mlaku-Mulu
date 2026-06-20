import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '@prisma/client';

export class CreatePassportNestedDto {
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

export class CreateTouristDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '1990-05-15', type: String, format: 'date' })
  @IsDateString()
  birthDate: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: 'United States' })
  @IsString()
  @IsNotEmpty()
  nationality: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Password (min 8 characters)' })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'VIP guest, prefers window seat' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ type: CreatePassportNestedDto })
  @ValidateNested()
  @Type(() => CreatePassportNestedDto)
  passport: CreatePassportNestedDto;
}
