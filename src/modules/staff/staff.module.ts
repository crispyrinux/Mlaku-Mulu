import { Module } from '@nestjs/common';
import { PasswordService } from '../../common/security/password.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';

@Module({
  imports: [PrismaModule],
  controllers: [StaffController],
  providers: [StaffService, PasswordService],
  exports: [StaffService],
})
export class StaffModule {}
