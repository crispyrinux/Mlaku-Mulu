import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class UpdateEmployeeDto {
  @ApiPropertyOptional({
    example: 'John Doe',
    description: 'Full name of the employee',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  fullName?: string;

  @ApiPropertyOptional({
    example: 'john.doe@example.com',
    description: 'Email address of the employee',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'newpassword123',
    description: 'Password of the employee (minimum 8 characters)',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({
    example: '1995-10-15',
    description: 'Birth date of the employee (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiPropertyOptional({
    enum: Gender,
    example: Gender.MALE,
    description: 'Gender of the employee',
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({
    example: 'Indonesian',
    description: 'Nationality of the employee',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  nationality?: string;

  @ApiPropertyOptional({
    example: 'A12345678',
    description: 'Passport number of the employee',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  passportNumber?: string;
}
