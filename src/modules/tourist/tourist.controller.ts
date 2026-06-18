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
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { TouristService } from './tourist.service';
import { CreateTouristDto } from './dto/create-tourist.dto';
import { TouristResponseDto } from './responses/tourist-response.dto';
import { TouristListResponseDto } from './responses/tourist-list-response.dto';
import { TouristQueryDto } from './dto/tourist-query.dto';
import { UpdateTouristDto } from './dto/update-tourist.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Tourists')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tourists')
export class TouristController {
  constructor(private readonly touristService: TouristService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new tourist' })
  @ApiBody({ type: CreateTouristDto })
  @ApiCreatedResponse({ type: TouristResponseDto })
  async create(
    @Body() createTouristDto: CreateTouristDto,
  ): Promise<TouristResponseDto> {
    return this.touristService.create(createTouristDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all tourists with pagination, search, and sorting',
  })
  @ApiOkResponse({ type: TouristListResponseDto })
  async findAll(
    @Query() query: TouristQueryDto,
  ): Promise<TouristListResponseDto> {
    return this.touristService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get tourist details' })
  @ApiOkResponse({ type: TouristResponseDto })
  async findOne(@Param('id') id: string): Promise<TouristResponseDto> {
    return this.touristService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update tourist details' })
  @ApiBody({ type: UpdateTouristDto })
  @ApiOkResponse({ type: TouristResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateTouristDto: UpdateTouristDto,
  ): Promise<TouristResponseDto> {
    return this.touristService.update(id, updateTouristDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a tourist' })
  @ApiNoContentResponse({ description: 'Tourist successfully deleted' })
  async softDelete(@Param('id') id: string): Promise<void> {
    return this.touristService.softDelete(id);
  }
}
