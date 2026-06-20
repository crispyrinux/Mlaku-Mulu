import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import * as Prisma from '@prisma/client';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { VisaApplicationsService } from './visa-applications.service';
import { CreateVisaApplicationDto } from './dto/create-visa-application.dto';
import { UpdateVisaApplicationDto } from './dto/update-visa-application.dto';
import { VisaApplicationQueryDto } from './dto/visa-application-query.dto';
import { UpdateVisaApplicationStatusDto } from './dto/update-visa-application-status.dto';
import { VisaApplicationResponseDto } from './responses/visa-application-response.dto';


@ApiTags('Visa Applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/v1/visa-applications')
export class VisaApplicationsController {
  constructor(
    private readonly visaApplicationsService: VisaApplicationsService,
  ) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new visa application (Super Admin, Admin)',
    description: '### Access Level: **Super Admin** & **Admin** (Employee)\n\nCreates a new visa application record.',
  })
  @ApiBody({ type: CreateVisaApplicationDto })
  @ApiCreatedResponse({ description: 'Visa application created successfully', type: VisaApplicationResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  create(
    @Body() createDto: CreateVisaApplicationDto,
    @CurrentUser() employee: Prisma.Employee,
  ) {
    return this.visaApplicationsService.create(createDto, employee.id);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get paginated list of visa applications (Super Admin, Admin, Staff)',
    description: '### Access Level: **All Employees** (Super Admin, Admin, Staff)\n\nRetrieves all visa applications with search/filtering parameters.',
  })
  @ApiOkResponse({ description: 'Paginated list of visa applications' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findAll(@Query() query: VisaApplicationQueryDto) {
    return this.visaApplicationsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get visa application detail by ID (Super Admin, Admin, Staff)',
    description: '### Access Level: **All Employees** (Super Admin, Admin, Staff)\n\nRetrieves visa application details (including tourist and passport details) by application ID.',
  })
  @ApiOkResponse({
    description: 'Visa application detail (includes tourist and passport)',
    type: VisaApplicationResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.visaApplicationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update visa application (Super Admin, Admin)',
    description: '### Access Level: **Super Admin** & **Admin** (Employee)\n\nUpdates a visa application record. Note: This action is only allowed if the application is in DRAFT status.',
  })
  @ApiBody({ type: UpdateVisaApplicationDto })
  @ApiOkResponse({ description: 'Visa application updated successfully', type: VisaApplicationResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateVisaApplicationDto,
    @CurrentUser() employee: Prisma.Employee,
  ) {
    return this.visaApplicationsService.update(id, updateDto, employee.id);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Soft delete a visa application (Super Admin)',
    description: '### Access Level: **Super Admin** only (Employee)\n\nSoft deletes a visa application record by application ID.',
  })
  @ApiNoContentResponse({
    description: 'Visa application deleted successfully',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.visaApplicationsService.softDelete(id);
  }

  @Patch(':id/status')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change the status of a visa application (Super Admin, Admin)',
    description: '### Access Level: **Super Admin** & **Admin** (Employee)\n\nUpdates the status of a visa application (state-machine transition).',
  })
  @ApiBody({ type: UpdateVisaApplicationStatusDto })
  @ApiOkResponse({
    description: 'Visa application status updated successfully',
    type: VisaApplicationResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusDto: UpdateVisaApplicationStatusDto,
    @CurrentUser() employee: Prisma.Employee,
  ) {
    return this.visaApplicationsService.updateStatus(
      id,
      statusDto,
      employee.id,
    );
  }
}
