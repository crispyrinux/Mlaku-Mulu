import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Gender } from '@prisma/client';

export class CreateEmployeeDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the employee',
  })
  @IsString()
  @MinLength(1)
  fullName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email address of the employee',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password of the employee (minimum 8 characters)',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: '1995-10-15',
    description: 'Birth date of the employee (YYYY-MM-DD)',
  })
  @IsString()
  birthDate: string;

  @ApiProperty({
    enum: Gender,
    example: Gender.MALE,
    description: 'Gender of the employee',
  })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    example: 'Indonesian',
    description: 'Nationality of the employee',
  })
  @IsString()
  @MinLength(1)
  nationality: string;

  @ApiProperty({
    example: 'A12345678',
    description: 'Passport number of the employee',
  })
  @IsString()
  @MinLength(1)
  passportNumber: string;
}
