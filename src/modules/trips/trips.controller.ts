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
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripQueryDto } from './dto/trip-query.dto';
import { TripResponseDto } from './responses/trip-response.dto';


@ApiTags('Trips')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new trip (Super Admin, Admin)',
    description: '### Access Level: **Super Admin** & **Admin** (Employee)\n\nCreates a new scheduled trip.',
  })
  @ApiBody({ type: CreateTripDto })
  @ApiCreatedResponse({ description: 'Trip created successfully', type: TripResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - insufficient role' })
  create(@Body() createTripDto: CreateTripDto) {
    return this.tripsService.create(createTripDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get paginated list of trips (Super Admin, Admin, Staff)',
    description: '### Access Level: **All Employees** (Super Admin, Admin, Staff)\n\nRetrieves a list of trips with search/filtering parameters.',
  })
  @ApiOkResponse({ description: 'Paginated list of trips' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findAll(@Query() query: TripQueryDto) {
    return this.tripsService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get trip detail by ID (Super Admin, Admin, Staff)',
    description: '### Access Level: **All Employees** (Super Admin, Admin, Staff)\n\nRetrieves detailed trip properties by trip ID.',
  })
  @ApiOkResponse({ description: 'Trip detail', type: TripResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tripsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a trip (Super Admin, Admin)',
    description: '### Access Level: **Super Admin** & **Admin** (Employee)\n\nUpdates an existing trip\'s properties.',
  })
  @ApiBody({ type: UpdateTripDto })
  @ApiOkResponse({ description: 'Trip updated successfully', type: TripResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - insufficient role' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTripDto: UpdateTripDto,
  ) {
    return this.tripsService.update(id, updateTripDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Soft delete a trip (Super Admin, Admin)',
    description: '### Access Level: **Super Admin** & **Admin** (Employee)\n\nSoft deletes a trip record by trip ID.',
  })
  @ApiNoContentResponse({ description: 'Trip deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - insufficient role' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.tripsService.softDelete(id);
  }
}
