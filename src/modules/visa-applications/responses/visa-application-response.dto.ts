import { ApiProperty } from '@nestjs/swagger';
import { VisaApplicationStatus } from '@prisma/client';

export class VisaApplicationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  applicationNumber: string;

  @ApiProperty()
  touristId: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  visaType: string;

  @ApiProperty({ enum: VisaApplicationStatus })
  status: VisaApplicationStatus;

  @ApiProperty({ type: String, format: 'date-time', required: false })
  submissionDate?: Date;

  @ApiProperty({ type: String, format: 'date-time', required: false })
  decisionDate?: Date;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty()
  createdByEmployeeId: string;

  @ApiProperty({ required: false })
  updatedByEmployeeId?: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}
