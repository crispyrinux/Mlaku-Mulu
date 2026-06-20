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
import * as Prisma from '@prisma/client';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserTypes } from '../../common/decorators/user-types.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TouristsService } from './tourists.service';
import { CreateTouristDto } from './dto/create-tourist.dto';
import { UpdateTouristDto } from './dto/update-tourist.dto';
import { TouristQueryDto } from './dto/tourist-query.dto';
import { TouristResponseDto } from './responses/tourist-response.dto';

@ApiTags('Tourists')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tourists')
export class TouristsController {
  constructor(private readonly touristsService: TouristsService) {}

  @Get('me')
  @UserTypes('TOURIST')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get current authenticated tourist profile',
    description: '### Access Level: **Tourist** (Tourist only)\n\nRetrieves the currently logged-in tourist profile.',
  })
  @ApiOkResponse({ description: 'Tourist profile', type: TouristResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getProfile(@CurrentUser() tourist: any) {
    return this.touristsService.findOne(tourist.id);
  }

  @Get('me/trips')
  @UserTypes('TOURIST')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get current authenticated tourist trip history',
    description: '### Access Level: **Tourist** (Tourist only)\n\nRetrieves the logged-in tourist\'s history of trips.',
  })
  @ApiOkResponse({ description: 'Tourist trip history' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getTripHistory(@CurrentUser() tourist: any) {
    return this.touristsService.findTripsForTourist(tourist.id);
  }

  @Get('me/trips/:tripId')
  @UserTypes('TOURIST')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get details of a trip assigned to the current tourist',
    description: '### Access Level: **Tourist** (Tourist only)\n\nRetrieves details of a specific trip assigned to the logged-in tourist.',
  })
  @ApiOkResponse({ description: 'Tourist trip detail' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getTripDetail(
    @Param('tripId', ParseUUIDPipe) tripId: string,
    @CurrentUser() tourist: any,
  ) {
    return this.touristsService.findTripDetailsForTourist(tourist.id, tripId);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new tourist',
    description: '### Access Level: **Super Admin** & **Admin** (Employee)\n\nRegisters a new tourist with passport details.',
  })
  @ApiBody({ type: CreateTouristDto })
  @ApiCreatedResponse({ description: 'Tourist created successfully', type: TouristResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  create(
    @Body() createTouristDto: CreateTouristDto,
    @CurrentUser() employee: Prisma.Employee,
  ) {
    return this.touristsService.create(createTouristDto, employee.id);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get paginated list of tourists',
    description: '### Access Level: **All Employees** (Super Admin, Admin, Staff)\n\nRetrieves all tourists with search/filtering parameters.',
  })
  @ApiOkResponse({ description: 'Paginated list of tourists' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findAll(@Query() query: TouristQueryDto) {
    return this.touristsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get tourist detail by ID',
    description: '### Access Level: **All Employees** (Super Admin, Admin, Staff)\n\nRetrieves tourist profile details by tourist ID.',
  })
  @ApiOkResponse({ description: 'Tourist detail', type: TouristResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.touristsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update tourist',
    description: '### Access Level: **Super Admin** & **Admin** (Employee)\n\nUpdates a tourist\'s profile. Note: passport records must be updated separately.',
  })
  @ApiBody({ type: UpdateTouristDto })
  @ApiOkResponse({ description: 'Tourist updated successfully', type: TouristResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTouristDto: UpdateTouristDto,
    @CurrentUser() employee: Prisma.Employee,
  ) {
    return this.touristsService.update(id, updateTouristDto, employee.id);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Soft delete a tourist',
    description: '### Access Level: **Super Admin** only (Employee)\n\nSoft deletes a tourist by tourist ID.',
  })
  @ApiNoContentResponse({ description: 'Tourist deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.touristsService.softDelete(id);
  }
}
