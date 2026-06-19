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
import { VisaApplicationsService } from './visa-applications.service';
import { CreateVisaApplicationDto } from './dto/create-visa-application.dto';
import { UpdateVisaApplicationDto } from './dto/update-visa-application.dto';
import { VisaApplicationQueryDto } from './dto/visa-application-query.dto';
import { UpdateVisaApplicationStatusDto } from './dto/update-visa-application-status.dto';

@ApiTags('Visa Applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/visa-applications')
export class VisaApplicationsController {
  constructor(
    private readonly visaApplicationsService: VisaApplicationsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new visa application' })
  @ApiBody({ type: CreateVisaApplicationDto })
  @ApiCreatedResponse({ description: 'Visa application created successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  create(
    @Body() createDto: CreateVisaApplicationDto,
    @CurrentUser() employee: Prisma.Employee,
  ) {
    return this.visaApplicationsService.create(createDto, employee.id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get paginated list of visa applications' })
  @ApiOkResponse({ description: 'Paginated list of visa applications' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findAll(@Query() query: VisaApplicationQueryDto) {
    return this.visaApplicationsService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get visa application detail by ID' })
  @ApiOkResponse({ description: 'Visa application detail (includes tourist and passport)' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.visaApplicationsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update visa application (only allowed in DRAFT status)' })
  @ApiBody({ type: UpdateVisaApplicationDto })
  @ApiOkResponse({ description: 'Visa application updated successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateVisaApplicationDto,
    @CurrentUser() employee: Prisma.Employee,
  ) {
    return this.visaApplicationsService.update(id, updateDto, employee.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a visa application' })
  @ApiNoContentResponse({ description: 'Visa application deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.visaApplicationsService.softDelete(id);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change the status of a visa application' })
  @ApiBody({ type: UpdateVisaApplicationStatusDto })
  @ApiOkResponse({ description: 'Visa application status updated successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusDto: UpdateVisaApplicationStatusDto,
    @CurrentUser() employee: Prisma.Employee,
  ) {
    return this.visaApplicationsService.updateStatus(id, statusDto, employee.id);
  }
}
