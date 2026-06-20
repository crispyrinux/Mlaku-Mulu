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
import { StaffModule } from './modules/staff/staff.module';
import { TouristsModule } from './modules/tourists/tourists.module';
import { PassportsModule } from './modules/passports/passports.module';
import { DestinationsModule } from './modules/destinations/destinations.module';
import { TripsModule } from './modules/trips/trips.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { VisaApplicationsModule } from './modules/visa-applications/visa-applications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
    StaffModule,
    TouristsModule,
    PassportsModule,
    DestinationsModule,
    TripsModule,
    AssignmentsModule,
    VisaApplicationsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
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
