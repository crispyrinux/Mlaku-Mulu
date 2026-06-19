import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VisaApplicationStatus } from '@prisma/client';

export class UpdateVisaApplicationStatusDto {
  @ApiProperty({
    enum: VisaApplicationStatus,
    description: 'The new status of the visa application',
    example: VisaApplicationStatus.SUBMITTED,
  })
  @IsNotEmpty()
  @IsEnum(VisaApplicationStatus)
  status: VisaApplicationStatus;

  @ApiPropertyOptional({
    description: 'Additional notes or remarks regarding the status change',
    example: 'Documents are complete and correct.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
