import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PassportsService } from './passports.service';
import { CreatePassportDto } from './dto/create-passport.dto';
import { UpdatePassportDto } from './dto/update-passport.dto';
import { PassportResponseDto } from './responses/passport-response.dto';


@ApiTags('Passports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('passports')
export class PassportsController {
  constructor(private readonly passportsService: PassportsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a passport for a tourist',
    description: '### Access Level: **Super Admin** & **Admin** (Employee)\n\nCreates a passport record for a tourist.',
  })
  @ApiBody({ type: CreatePassportDto })
  @ApiCreatedResponse({ description: 'Passport created successfully', type: PassportResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  create(@Body() createPassportDto: CreatePassportDto) {
    return this.passportsService.create(createPassportDto);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get passport detail with tourist summary',
    description: '### Access Level: **All Employees** (Super Admin, Admin, Staff)\n\nRetrieves passport details and the associated tourist information by passport ID.',
  })
  @ApiOkResponse({ description: 'Passport detail', type: PassportResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.passportsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update passport',
    description: '### Access Level: **Super Admin** & **Admin** (Employee)\n\nUpdates a passport record. Note: passport number cannot be changed once created.',
  })
  @ApiBody({ type: UpdatePassportDto })
  @ApiOkResponse({ description: 'Passport updated successfully', type: PassportResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePassportDto: UpdatePassportDto,
  ) {
    return this.passportsService.update(id, updatePassportDto);
  }
}
