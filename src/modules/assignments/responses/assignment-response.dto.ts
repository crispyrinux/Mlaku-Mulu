import { ApiProperty } from '@nestjs/swagger';

export class AssignmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  employeeId: string;

  @ApiProperty()
  touristId: string;

  @ApiProperty({ type: String, format: 'date-time' })
  assignedAt: Date;
}
