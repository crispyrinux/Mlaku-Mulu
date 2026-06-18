import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '@prisma/client';

export class TouristResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: Gender })
  gender: Gender;

  @ApiProperty()
  birthDate: Date;

  @ApiProperty()
  nationality: string;

  @ApiProperty()
  passportNumber: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  assignmentCount: number;

  @ApiProperty()
  tripCount: number;
}
