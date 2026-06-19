import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PassportsController } from './passports.controller';
import { PassportsService } from './passports.service';

@Module({
  imports: [PrismaModule],
  controllers: [PassportsController],
  providers: [PassportsService],
  exports: [PassportsService],
})
export class PassportsModule {}
