import { ApiProperty } from '@nestjs/swagger';
import { Gender, Role } from '@prisma/client';

export class StaffResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty({ type: String, format: 'date-time' })
  birthDate: Date;

  @ApiProperty({ enum: Gender })
  gender: Gender;

  @ApiProperty()
  nationality: string;

  @ApiProperty()
  passportNumber: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}
