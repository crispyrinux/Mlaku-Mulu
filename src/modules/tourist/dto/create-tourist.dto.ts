import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class CreateTouristDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(1)
  fullName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: '1990-01-01' })
  @IsDateString()
  birthDate: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ example: 'Indonesian' })
  @IsString()
  @MinLength(1)
  nationality: string;

  @ApiProperty({ example: 'A1234567' })
  @IsString()
  @MinLength(1)
  passportNumber: string;

  @ApiProperty({ example: '+628123456789' })
  @IsString()
  @MinLength(1)
  phoneNumber: string;
}
