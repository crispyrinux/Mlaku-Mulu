import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../../common/security/password.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeeResponseDto } from './responses/employee-response.dto';
import { Employee, Role, Gender } from '@prisma/client';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { toPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class EmployeeService {
  private readonly sortableFields = new Set([
    'id',
    'fullName',
    'email',
    'createdAt',
    'updatedAt',
  ]);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async create(
    createEmployeeDto: CreateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    const existingEmployee = await this.prisma.employee.findFirst({
      where: { email: createEmployeeDto.email, deletedAt: null },
    });

    if (existingEmployee) {
      throw new BadRequestException('Email already exists');
    }

    const password = await this.passwordService.hash(
      createEmployeeDto.password,
    );

    const employee = await this.prisma.employee.create({
      data: {
        fullName: createEmployeeDto.fullName,
        email: createEmployeeDto.email,
        password,
        role: 'STAFF',
        birthDate: new Date(createEmployeeDto.birthDate),
        gender: createEmployeeDto.gender,
        nationality: createEmployeeDto.nationality,
        passportNumber: createEmployeeDto.passportNumber,
        isActive: true,
      },
    });

    return this.toResponseDto(employee);
  }

  async findOne(id: string): Promise<EmployeeResponseDto> {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return this.toResponseDto(employee);
  }

  async findAll(
    query: EmployeeQueryDto,
  ): Promise<PaginatedResponse<EmployeeResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const total = await this.prisma.employee.count({ where });
    const items = await this.prisma.employee.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    const responseItems = items.map((employee) => this.toResponseDto(employee));
    return toPaginatedResponse(responseItems, total, page, limit);
  }

  async update(
    id: string,
    updateEmployeeDto: UpdateEmployeeDto,
  ): Promise<EmployeeResponseDto> {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      const existingEmployee = await this.prisma.employee.findFirst({
        where: { email: updateEmployeeDto.email, deletedAt: null },
      });

      if (existingEmployee) {
        throw new BadRequestException('Email already exists');
      }
    }

    const password = updateEmployeeDto.password
      ? await this.passwordService.hash(updateEmployeeDto.password)
      : undefined;

    const updatedEmployee = await this.prisma.employee.update({
      where: { id },
      data: {
        ...(updateEmployeeDto.fullName !== undefined
          ? { fullName: updateEmployeeDto.fullName }
          : {}),
        ...(updateEmployeeDto.email !== undefined
          ? { email: updateEmployeeDto.email }
          : {}),
        ...(password !== undefined ? { password } : {}),
        ...(updateEmployeeDto.birthDate !== undefined
          ? { birthDate: new Date(updateEmployeeDto.birthDate) }
          : {}),
        ...(updateEmployeeDto.gender !== undefined
          ? { gender: updateEmployeeDto.gender }
          : {}),
        ...(updateEmployeeDto.nationality !== undefined
          ? { nationality: updateEmployeeDto.nationality }
          : {}),
        ...(updateEmployeeDto.passportNumber !== undefined
          ? { passportNumber: updateEmployeeDto.passportNumber }
          : {}),
      },
    });

    return this.toResponseDto(updatedEmployee);
  }

  async softDelete(id: string): Promise<void> {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    await this.prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private toResponseDto(employee: Employee): EmployeeResponseDto {
    return {
      id: employee.id,
      fullName: employee.fullName,
      email: employee.email,
      role: employee.role,
      birthDate: employee.birthDate,
      gender: employee.gender,
      nationality: employee.nationality,
      passportNumber: employee.passportNumber,
      isActive: employee.isActive,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    };
  }
}
