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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PassportsService } from './passports.service';
import { CreatePassportDto } from './dto/create-passport.dto';
import { UpdatePassportDto } from './dto/update-passport.dto';

@ApiTags('Passports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('passports')
export class PassportsController {
  constructor(private readonly passportsService: PassportsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a passport for a tourist' })
  @ApiBody({ type: CreatePassportDto })
  @ApiCreatedResponse({ description: 'Passport created successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  create(@Body() createPassportDto: CreatePassportDto) {
    return this.passportsService.create(createPassportDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get passport detail with tourist summary' })
  @ApiOkResponse({ description: 'Passport detail' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.passportsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update passport (passport number cannot be changed)' })
  @ApiBody({ type: UpdatePassportDto })
  @ApiOkResponse({ description: 'Passport updated successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePassportDto: UpdatePassportDto,
  ) {
    return this.passportsService.update(id, updatePassportDto);
  }
}
