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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TouristsService } from './tourists.service';
import { CreateTouristDto } from './dto/create-tourist.dto';
import { UpdateTouristDto } from './dto/update-tourist.dto';
import { TouristQueryDto } from './dto/tourist-query.dto';

@ApiTags('Tourists')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tourists')
export class TouristsController {
  constructor(private readonly touristsService: TouristsService) {}

  @Post()
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get paginated list of tourists' })
  @ApiOkResponse({ description: 'Paginated list of tourists' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findAll(@Query() query: TouristQueryDto) {
    return this.touristsService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get tourist detail by ID' })
  @ApiOkResponse({ description: 'Tourist detail' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.touristsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update tourist (passport number cannot be changed)' })
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a tourist' })
  @ApiNoContentResponse({ description: 'Tourist deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.touristsService.softDelete(id);
  }
}
