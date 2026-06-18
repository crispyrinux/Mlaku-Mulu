import { Module } from '@nestjs/common';
import { PasswordService } from '../../common/security/password.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';

@Module({
  imports: [PrismaModule],
  controllers: [EmployeeController],
  providers: [EmployeeService, PasswordService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
