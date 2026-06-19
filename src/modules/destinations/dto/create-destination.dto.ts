import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDestinationDto {
  @ApiProperty({ example: 'Bali Beach Resort' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'A beautiful tropical resort with ocean views' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Indonesia' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: 'Denpasar' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
