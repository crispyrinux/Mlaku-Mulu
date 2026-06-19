import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { AssignmentQueryDto } from './dto/assignment-query.dto';
import { Prisma } from '@prisma/client';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { toPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class AssignmentsService {
  private readonly assignmentInclude = {
    employee: {
      select: { id: true, fullName: true },
    },
    tourist: {
      select: { id: true, fullName: true },
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  async create(createAssignmentDto: CreateAssignmentDto) {
    // Validate employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: createAssignmentDto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Validate tourist exists
    const tourist = await this.prisma.tourist.findUnique({
      where: { id: createAssignmentDto.touristId },
    });

    if (!tourist) {
      throw new NotFoundException('Tourist not found');
    }

    const assignment = await this.prisma.assignment.create({
      data: {
        employeeId: createAssignmentDto.employeeId,
        touristId: createAssignmentDto.touristId,
      },
      include: this.assignmentInclude,
    });

    return assignment;
  }

  async findAll(query: AssignmentQueryDto): Promise<PaginatedResponse<any>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();
    const sortBy = query.sortBy ?? 'assignedAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.AssignmentWhereInput = {
      ...(query.employeeId ? { employeeId: query.employeeId } : {}),
      ...(query.touristId ? { touristId: query.touristId } : {}),
      ...(search
        ? {
            OR: [
              {
                employee: {
                  fullName: { contains: search, mode: 'insensitive' as const },
                },
              },
              {
                tourist: {
                  fullName: { contains: search, mode: 'insensitive' as const },
                },
              },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.assignment.count({ where }),
      this.prisma.assignment.findMany({
        where,
        include: this.assignmentInclude,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return toPaginatedResponse(items, total, page, limit);
  }

  async findOne(id: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: this.assignmentInclude,
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return assignment;
  }

  async remove(id: string): Promise<void> {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    await this.prisma.assignment.delete({
      where: { id },
    });
  }
}
