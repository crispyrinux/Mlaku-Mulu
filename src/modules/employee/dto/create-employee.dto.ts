import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Gender } from '@prisma/client';

export class CreateEmployeeDto {
  @IsString()
  @MinLength(1)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  birthDate: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  @MinLength(1)
  nationality: string;

  @IsString()
  @MinLength(1)
  passportNumber: string;
}
