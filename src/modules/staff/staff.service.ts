import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../../common/security/password.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { StaffQueryDto } from './dto/staff-query.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffResponseDto } from './responses/staff-response.dto';
import { Employee, Role, Gender } from '@prisma/client';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { toPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class StaffService {
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
    createStaffDto: CreateStaffDto,
  ): Promise<StaffResponseDto> {
    const existingStaffMember = await this.prisma.employee.findFirst({
      where: { email: createStaffDto.email, deletedAt: null },
    });

    if (existingStaffMember) {
      throw new BadRequestException('Email already exists');
    }

    const password = await this.passwordService.hash(
      createStaffDto.password,
    );

    const employee = await this.prisma.employee.create({
      data: {
        fullName: createStaffDto.fullName,
        email: createStaffDto.email,
        password,
        role: 'STAFF',
        birthDate: new Date(createStaffDto.birthDate),
        gender: createStaffDto.gender,
        nationality: createStaffDto.nationality,
        passportNumber: createStaffDto.passportNumber,
        isActive: true,
      },
    });

    return this.toResponseDto(employee);
  }

  async createAdmin(
    createStaffDto: CreateStaffDto,
  ): Promise<StaffResponseDto> {
    const existingEmployee = await this.prisma.employee.findFirst({
      where: { email: createStaffDto.email, deletedAt: null },
    });

    if (existingEmployee) {
      throw new BadRequestException('Email already exists');
    }

    const password = await this.passwordService.hash(
      createStaffDto.password,
    );

    const employee = await this.prisma.employee.create({
      data: {
        fullName: createStaffDto.fullName,
        email: createStaffDto.email,
        password,
        role: 'ADMIN',
        birthDate: new Date(createStaffDto.birthDate),
        gender: createStaffDto.gender,
        nationality: createStaffDto.nationality,
        passportNumber: createStaffDto.passportNumber,
        isActive: true,
      },
    });

    return this.toResponseDto(employee);
  }

  async findOne(id: string): Promise<StaffResponseDto> {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException('Staff not found');
    }

    return this.toResponseDto(employee);
  }

  async findAll(
    query: StaffQueryDto,
  ): Promise<PaginatedResponse<StaffResponseDto>> {
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
    updateStaffDto: UpdateStaffDto,
  ): Promise<StaffResponseDto> {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null },
    });

    if (!employee) {
      throw new NotFoundException('Staff not found');
    }

    if (updateStaffDto.email && updateStaffDto.email !== employee.email) {
      const existingStaffMember = await this.prisma.employee.findFirst({
        where: { email: updateStaffDto.email, deletedAt: null },
      });

      if (existingStaffMember) {
        throw new BadRequestException('Email already exists');
      }
    }

    const password = updateStaffDto.password
      ? await this.passwordService.hash(updateStaffDto.password)
      : undefined;

    const updatedEmployee = await this.prisma.employee.update({
      where: { id },
      data: {
        ...(updateStaffDto.fullName !== undefined
          ? { fullName: updateStaffDto.fullName }
          : {}),
        ...(updateStaffDto.email !== undefined
          ? { email: updateStaffDto.email }
          : {}),
        ...(password !== undefined ? { password } : {}),
        ...(updateStaffDto.birthDate !== undefined
          ? { birthDate: new Date(updateStaffDto.birthDate) }
          : {}),
        ...(updateStaffDto.gender !== undefined
          ? { gender: updateStaffDto.gender }
          : {}),
        ...(updateStaffDto.nationality !== undefined
          ? { nationality: updateStaffDto.nationality }
          : {}),
        ...(updateStaffDto.passportNumber !== undefined
          ? { passportNumber: updateStaffDto.passportNumber }
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
      throw new NotFoundException('Staff not found');
    }

    await this.prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private toResponseDto(employee: Employee): StaffResponseDto {
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
