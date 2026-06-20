import { ApiProperty } from '@nestjs/swagger';

export class PassportResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  touristId: string;

  @ApiProperty()
  passportNumber: string;

  @ApiProperty({ type: String, format: 'date-time', required: false })
  issueDate?: Date;

  @ApiProperty({ type: String, format: 'date-time', required: false })
  expiryDate?: Date;

  @ApiProperty({ required: false })
  placeOfIssue?: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}
