import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateVisaApplicationDto {
  @ApiProperty({
    description: 'The UUID of the tourist applying for the visa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  touristId: string;

  @ApiProperty({
    description: 'The destination country for the visa application',
    example: 'Japan',
  })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({
    description: 'The type of visa being applied for',
    example: 'Tourist Visa',
  })
  @IsNotEmpty()
  @IsString()
  visaType: string;

  @ApiPropertyOptional({
    description: 'Additional notes or remarks for the visa application',
    example: 'First time visiting Japan, staying for 2 weeks.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
