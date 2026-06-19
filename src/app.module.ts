import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import appConfig from './config/app.config';
import { envValidationSchema } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaExceptionFilter } from './common/exceptions/prisma-exception.filter';
import { ThrottlerExceptionFilter } from './common/exceptions/throttler-exception.filter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { TouristsModule } from './modules/tourists/tourists.module';
import { PassportsModule } from './modules/passports/passports.module';
import { DestinationModule } from './modules/destination/destination.module';
import { TripModule } from './modules/trip/trip.module';
import { AssignmentModule } from './modules/assignment/assignment.module';
import { VisaApplicationsModule } from './modules/visa-applications/visa-applications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('throttle.ttl') ?? 60000,
          limit: config.get<number>('throttle.limit') ?? 100,
        },
      ],
    }),
    PrismaModule,
    AuthModule,
    EmployeeModule,
    TouristsModule,
    PassportsModule,
    DestinationModule,
    TripModule,
    AssignmentModule,
    VisaApplicationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ThrottlerExceptionFilter,
    },
  ],
})
export class AppModule {}
