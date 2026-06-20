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
import { DestinationsService } from './destinations.service';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import { DestinationQueryDto } from './dto/destination-query.dto';
import { DestinationResponseDto } from './responses/destination-response.dto';


@ApiTags('Destinations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new destination',
    description: '### Access Level: **Super Admin** & **Admin** (Employee)\n\nCreates a new holiday destination.',
  })
  @ApiBody({ type: CreateDestinationDto })
  @ApiCreatedResponse({ description: 'Destination created successfully', type: DestinationResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin only' })
  create(@Body() createDestinationDto: CreateDestinationDto) {
    return this.destinationsService.create(createDestinationDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get paginated list of destinations',
    description: '### Access Level: **All Employees** (Super Admin, Admin, Staff)\n\nRetrieves all destinations with paginated search/filtering parameters.',
  })
  @ApiOkResponse({ description: 'Paginated list of destinations' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findAll(@Query() query: DestinationQueryDto) {
    return this.destinationsService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get destination detail by ID',
    description: '### Access Level: **All Employees** (Super Admin, Admin, Staff)\n\nRetrieves destination details by destination ID.',
  })
  @ApiOkResponse({ description: 'Destination detail', type: DestinationResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.destinationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update a destination',
    description: '### Access Level: **Super Admin** & **Admin** (Employee)\n\nUpdates a destination\'s properties.',
  })
  @ApiBody({ type: UpdateDestinationDto })
  @ApiOkResponse({ description: 'Destination updated successfully', type: DestinationResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin only' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDestinationDto: UpdateDestinationDto,
  ) {
    return this.destinationsService.update(id, updateDestinationDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Soft delete a destination',
    description: '### Access Level: **Super Admin** & **Admin** (Employee)\n\nSoft deletes a destination by destination ID.',
  })
  @ApiNoContentResponse({ description: 'Destination deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin only' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.destinationsService.softDelete(id);
  }
}
