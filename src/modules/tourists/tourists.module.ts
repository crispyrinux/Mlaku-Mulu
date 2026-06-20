import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PasswordService } from '../../common/security/password.service';
import { TouristsController } from './tourists.controller';
import { TouristsService } from './tourists.service';

@Module({
  imports: [PrismaModule],
  controllers: [TouristsController],
  providers: [TouristsService, PasswordService],
  exports: [TouristsService],
})
export class TouristsModule {}
