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
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TouristsService } from './tourists.service';
import { CreateTouristDto } from './dto/create-tourist.dto';
import { UpdateTouristDto } from './dto/update-tourist.dto';
import { TouristQueryDto } from './dto/tourist-query.dto';

@ApiTags('Tourists')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tourists')
export class TouristsController {
  constructor(private readonly touristsService: TouristsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new tourist' })
  @ApiBody({ type: CreateTouristDto })
  @ApiCreatedResponse({ description: 'Tourist created successfully' })
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
  @ApiOperation({ summary: 'Get paginated list of tourists' })
  @ApiOkResponse({ description: 'Paginated list of tourists' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findAll(@Query() query: TouristQueryDto) {
    return this.touristsService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.STAFF)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get tourist detail by ID' })
  @ApiOkResponse({ description: 'Tourist detail' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.touristsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update tourist (passport managed separately)' })
  @ApiBody({ type: UpdateTouristDto })
  @ApiOkResponse({ description: 'Tourist updated successfully' })
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
  @ApiOperation({ summary: 'Soft delete a tourist' })
  @ApiNoContentResponse({ description: 'Tourist deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.touristsService.softDelete(id);
  }
}
