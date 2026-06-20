import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Gender, TouristStatus } from '@prisma/client';

export class UpdateTouristDto {
  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({ example: '1992-08-20', type: String, format: 'date' })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiPropertyOptional({ enum: Gender, example: Gender.FEMALE })
  @IsEnum(Gender)
  @IsOptional()
  gender?: Gender;

  @ApiPropertyOptional({ example: 'Canada' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  nationality?: string;

  @ApiPropertyOptional({ example: 'jane.doe@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'newpassword123', description: 'New password (min 8 characters)' })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({ example: '+9876543210' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'Updated travel notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    enum: TouristStatus,
    example: TouristStatus.ACTIVE,
  })
  @IsEnum(TouristStatus)
  @IsOptional()
  status?: TouristStatus;
}
