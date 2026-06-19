import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateAssignmentDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID of the employee to assign',
  })
  @IsUUID()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'UUID of the tourist to assign',
  })
  @IsUUID()
  @IsNotEmpty()
  touristId: string;
}
