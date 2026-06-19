import { Module } from '@nestjs/common';
import { VisaApplicationsService } from './visa-applications.service';
import { VisaApplicationsController } from './visa-applications.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VisaApplicationsController],
  providers: [VisaApplicationsService],
  exports: [VisaApplicationsService],
})
export class VisaApplicationsModule {}
