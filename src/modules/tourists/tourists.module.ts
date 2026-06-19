import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { TouristsController } from './tourists.controller';
import { TouristsService } from './tourists.service';

@Module({
  imports: [PrismaModule],
  controllers: [TouristsController],
  providers: [TouristsService],
  exports: [TouristsService],
})
export class TouristsModule {}
