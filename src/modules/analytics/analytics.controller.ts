import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserTypes } from '../../common/decorators/user-types.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AnalyticsService } from './analytics.service';
import { AdminAnalyticsResponseDto } from './dto/admin-analytics.dto';
import { StaffAnalyticsResponseDto } from './dto/staff-analytics.dto';
import { TouristAnalyticsResponseDto } from './dto/tourist-analytics.dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('admin')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Admin dashboard analytics metrics',
    description: '### Access Level: **Super Admin** & **Admin** (Employee)\n\nRetrieves global operational analytics of Mlaku-Mulu including total tourists, employees, destinations, active trips, visa application status distribution, and top 5 staff by workload.',
  })
  @ApiOkResponse({
    type: AdminAnalyticsResponseDto,
    description: 'Successfully retrieved admin analytics',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin/Super Admin only' })
  async getAdminDashboard(): Promise<AdminAnalyticsResponseDto> {
    return this.analyticsService.getAdminDashboard();
  }

  @Get('staff')
  @Roles(Role.STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Staff dashboard analytics metrics',
    description: '### Access Level: **Staff** (Employee)\n\nRetrieves personal operational metrics for the logged-in staff, including total assigned tourists, active trips, a list of upcoming trips for assigned tourists, and the 5 most recent visa applications processed.',
  })
  @ApiOkResponse({
    type: StaffAnalyticsResponseDto,
    description: 'Successfully retrieved staff analytics',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Staff only' })
  async getStaffDashboard(@CurrentUser() employee: any): Promise<StaffAnalyticsResponseDto> {
    return this.analyticsService.getStaffDashboard(employee.id);
  }

  @Get('tourist')
  @UserTypes('TOURIST')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Tourist dashboard analytics metrics',
    description: '### Access Level: **Tourist** (Tourist only)\n\nRetrieves personal travel statistics for the logged-in tourist, passport expiry countdown alert (warning if < 180 days), total trip history stats, and the latest active visa application status.',
  })
  @ApiOkResponse({
    type: TouristAnalyticsResponseDto,
    description: 'Successfully retrieved tourist analytics',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Tourist only' })
  async getTouristDashboard(@CurrentUser() tourist: any): Promise<TouristAnalyticsResponseDto> {
    return this.analyticsService.getTouristDashboard(tourist.id);
  }
}


