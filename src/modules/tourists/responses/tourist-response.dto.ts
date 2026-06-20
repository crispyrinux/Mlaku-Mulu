import { ApiProperty } from '@nestjs/swagger';
import { TouristStatus, Gender } from '@prisma/client';

export class TouristResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ type: String, format: 'date-time' })
  birthDate: Date;

  @ApiProperty({ enum: Gender })
  gender: Gender;

  @ApiProperty()
  nationality: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty({ enum: TouristStatus })
  status: TouristStatus;

  @ApiProperty()
  createdByEmployeeId: string;

  @ApiProperty({ required: false })
  updatedByEmployeeId?: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}
