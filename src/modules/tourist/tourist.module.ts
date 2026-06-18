import { Module } from '@nestjs/common';
import { PasswordService } from '../../common/security/password.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { TouristController } from './tourist.controller';
import { TouristService } from './tourist.service';

@Module({
  imports: [PrismaModule],
  controllers: [TouristController],
  providers: [TouristService, PasswordService],
  exports: [TouristService],
})
export class TouristModule {}
