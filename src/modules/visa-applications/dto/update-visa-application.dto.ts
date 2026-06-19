import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateVisaApplicationDto {
  @ApiPropertyOptional({
    description: 'The destination country for the visa application',
    example: 'South Korea',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'The type of visa being applied for',
    example: 'Business Visa',
  })
  @IsOptional()
  @IsString()
  visaType?: string;

  @ApiPropertyOptional({
    description: 'Additional notes or remarks for the visa application',
    example: 'Updated travel itinerary.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
