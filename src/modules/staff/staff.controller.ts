import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateStaffDto } from './dto/create-staff.dto';
import { StaffQueryDto } from './dto/staff-query.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffResponseDto } from './responses/staff-response.dto';
import { StaffService } from './staff.service';

@ApiTags('Staff')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create staff (Super Admin, Admin)',
    description: '### Access Level: **Super Admin** & **Admin** (Staff)\n\nCreates a new employee (default role is Staff).',
  })
  @ApiBody({ type: CreateStaffDto })
  @ApiOkResponse({ type: StaffResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin only' })
  create(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.create(createStaffDto);
  }

  @Post('admin')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create admin (Super Admin)',
    description: '### Access Level: **Super Admin** (Staff)\n\nCreates a new admin.',
  })
  @ApiBody({ type: CreateStaffDto })
  @ApiOkResponse({ type: StaffResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Super Admin only' })
  createAdmin(@Body() createStaffDto: CreateStaffDto) {
    return this.staffService.createAdmin(createStaffDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List staff (Super Admin, Admin, Staff)',
    description: '### Access Level: **All Staff** (Super Admin, Admin, Staff)\n\nRetrieves a list of all employees with pagination search filters.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findAll(@Query() query: StaffQueryDto) {
    return this.staffService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get staff detail (Super Admin, Admin, Staff)',
    description: '### Access Level: **All Staff** (Super Admin, Admin, Staff)\n\nRetrieves staff profile details by staff ID.',
  })
  @ApiOkResponse({ type: StaffResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update staff (Super Admin, Admin)',
    description: '### Access Level: **Super Admin** & **Admin** (Staff)\n\nUpdates a staff\'s profile properties.',
  })
  @ApiBody({ type: UpdateStaffDto })
  @ApiOkResponse({ type: StaffResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin only' })
  update(
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
  ) {
    return this.staffService.update(id, updateStaffDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Soft delete staff (Super Admin, Admin)',
    description: '### Access Level: **Super Admin** & **Admin** (Staff)\n\nSoft deletes a staff by staff ID.',
  })
  @ApiNoContentResponse()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin only' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.staffService.softDelete(id);
  }
}
