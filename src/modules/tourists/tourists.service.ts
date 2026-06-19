import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTouristDto } from './dto/create-tourist.dto';
import { UpdateTouristDto } from './dto/update-tourist.dto';
import { TouristQueryDto } from './dto/tourist-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TouristsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTouristDto: CreateTouristDto, employeeId: string) {
    const existingTourist = await this.prisma.tourist.findFirst({
      where: {
        passportNumber: createTouristDto.passportNumber,
        deletedAt: null,
      },
    });

    if (existingTourist) {
      throw new BadRequestException(
        'Tourist with this passport number already exists',
      );
    }

    const tourist = await this.prisma.tourist.create({
      data: {
        fullName: createTouristDto.fullName,
        birthDate: new Date(createTouristDto.birthDate),
        gender: createTouristDto.gender,
        passportNumber: createTouristDto.passportNumber,
        nationality: createTouristDto.nationality,
        email: createTouristDto.email,
        phone: createTouristDto.phone,
        notes: createTouristDto.notes,
        createdByEmployeeId: employeeId,
      },
      include: {
        createdByEmployee: {
          select: { id: true, fullName: true },
        },
        updatedByEmployee: {
          select: { id: true, fullName: true },
        },
      },
    });

    return this.toResponse(tourist);
  }

  async findAll(query: TouristQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    const where: Prisma.TouristWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' as const } },
              {
                passportNumber: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
              {
                nationality: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.tourist.count({ where }),
      this.prisma.tourist.findMany({
        where,
        include: {
          createdByEmployee: {
            select: { id: true, fullName: true },
          },
          updatedByEmployee: {
            select: { id: true, fullName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      items: items.map((tourist) => this.toResponse(tourist)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const tourist = await this.prisma.tourist.findFirst({
      where: { id, deletedAt: null },
      include: {
        createdByEmployee: {
          select: { id: true, fullName: true },
        },
        updatedByEmployee: {
          select: { id: true, fullName: true },
        },
      },
    });

    if (!tourist) {
      throw new NotFoundException('Tourist not found');
    }

    return this.toResponse(tourist);
  }

  async update(
    id: string,
    updateTouristDto: UpdateTouristDto,
    employeeId: string,
  ) {
    const tourist = await this.prisma.tourist.findFirst({
      where: { id, deletedAt: null },
    });

    if (!tourist) {
      throw new NotFoundException('Tourist not found');
    }

    const updatedTourist = await this.prisma.tourist.update({
      where: { id },
      data: {
        ...(updateTouristDto.fullName !== undefined
          ? { fullName: updateTouristDto.fullName }
          : {}),
        ...(updateTouristDto.birthDate !== undefined
          ? { birthDate: new Date(updateTouristDto.birthDate) }
          : {}),
        ...(updateTouristDto.gender !== undefined
          ? { gender: updateTouristDto.gender }
          : {}),
        ...(updateTouristDto.nationality !== undefined
          ? { nationality: updateTouristDto.nationality }
          : {}),
        ...(updateTouristDto.email !== undefined
          ? { email: updateTouristDto.email }
          : {}),
        ...(updateTouristDto.phone !== undefined
          ? { phone: updateTouristDto.phone }
          : {}),
        ...(updateTouristDto.notes !== undefined
          ? { notes: updateTouristDto.notes }
          : {}),
        ...(updateTouristDto.status !== undefined
          ? { status: updateTouristDto.status }
          : {}),
        updatedByEmployeeId: employeeId,
      },
      include: {
        createdByEmployee: {
          select: { id: true, fullName: true },
        },
        updatedByEmployee: {
          select: { id: true, fullName: true },
        },
      },
    });

    return this.toResponse(updatedTourist);
  }

  async softDelete(id: string): Promise<void> {
    const tourist = await this.prisma.tourist.findFirst({
      where: { id, deletedAt: null },
    });

    if (!tourist) {
      throw new NotFoundException('Tourist not found');
    }

    await this.prisma.tourist.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private toResponse(tourist: any) {
    return {
      id: tourist.id,
      fullName: tourist.fullName,
      birthDate: tourist.birthDate,
      gender: tourist.gender,
      passportNumber: tourist.passportNumber,
      nationality: tourist.nationality,
      email: tourist.email,
      phone: tourist.phone,
      notes: tourist.notes,
      status: tourist.status,
      createdAt: tourist.createdAt,
      updatedAt: tourist.updatedAt,
      createdByEmployeeId: tourist.createdByEmployeeId,
      updatedByEmployeeId: tourist.updatedByEmployeeId,
      createdByEmployee: tourist.createdByEmployee ?? null,
      updatedByEmployee: tourist.updatedByEmployee ?? null,
    };
  }
}
