import { ApiProperty } from '@nestjs/swagger';

export class DestinationResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  country: string;

  @ApiProperty()
  city: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}
