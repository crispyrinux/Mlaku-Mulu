import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { envValidationSchema } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaExceptionFilter } from './common/exceptions/prisma-exception.filter';
import { AuthModule } from './modules/auth/auth.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { TouristsModule } from './modules/tourists/tourists.module';
import { PassportsModule } from './modules/passports/passports.module';
import { DestinationModule } from './modules/destination/destination.module';
import { TripModule } from './modules/trip/trip.module';
import { AssignmentModule } from './modules/assignment/assignment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema: envValidationSchema,
    }),
    PrismaModule,
    AuthModule,
    EmployeeModule,
    TouristsModule,
    PassportsModule,
    DestinationModule,
    TripModule,
    AssignmentModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
})
export class AppModule {}
