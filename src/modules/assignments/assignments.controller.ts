import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
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
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { AssignmentQueryDto } from './dto/assignment-query.dto';
import { AssignmentResponseDto } from './responses/assignment-response.dto';


@ApiTags('Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new assignment' })
  @ApiBody({ type: CreateAssignmentDto })
  @ApiCreatedResponse({ description: 'Assignment created successfully', type: AssignmentResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin only' })
  create(@Body() createAssignmentDto: CreateAssignmentDto) {
    return this.assignmentsService.create(createAssignmentDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get paginated list of assignments' })
  @ApiOkResponse({ description: 'Paginated list of assignments' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findAll(@Query() query: AssignmentQueryDto) {
    return this.assignmentsService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get assignment detail by ID' })
  @ApiOkResponse({ description: 'Assignment detail', type: AssignmentResponseDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.assignmentsService.findOne(id);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an assignment' })
  @ApiNoContentResponse({ description: 'Assignment deleted successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden - Admin only' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.assignmentsService.remove(id);
  }
}
