import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../../common/security/password.service';
import { CreateTouristDto } from './dto/create-tourist.dto';
import { TouristQueryDto } from './dto/tourist-query.dto';
import { UpdateTouristDto } from './dto/update-tourist.dto';
import { TouristResponseDto } from './responses/tourist-response.dto';
import { Tourist, Assignment, TripParticipant } from '@prisma/client';
import { TouristListMeta } from './interfaces/tourist-list-meta.interface';

@Injectable()
export class TouristService {
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
    createTouristDto: CreateTouristDto,
  ): Promise<TouristResponseDto> {
    const existingTourist = await this.prisma.tourist.findFirst({
      where: {
        deletedAt: null,
        OR: [
          { email: createTouristDto.email },
          { passportNumber: createTouristDto.passportNumber },
        ],
      },
    });

    if (existingTourist) {
      if (existingTourist.email === createTouristDto.email) {
        throw new BadRequestException('Email already exists');
      }
      if (existingTourist.passportNumber === createTouristDto.passportNumber) {
        throw new BadRequestException('Passport number already exists');
      }
    }

    const password = await this.passwordService.hash(createTouristDto.password);

    const tourist = await this.prisma.tourist.create({
      data: {
        fullName: createTouristDto.fullName,
        email: createTouristDto.email,
        password,
        birthDate: new Date(createTouristDto.birthDate),
        gender: createTouristDto.gender,
        nationality: createTouristDto.nationality,
        passportNumber: createTouristDto.passportNumber,
        phoneNumber: createTouristDto.phoneNumber,
        isActive: true,
      },
      include: {
        assignments: true,
        tripParticipants: true,
      },
    });

    return this.toResponseDto(tourist);
  }

  async findAll(query: TouristQueryDto): Promise<{
    items: TouristResponseDto[];
    meta: TouristListMeta;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();
    const sortBy = this.sortableFields.has(query.sortBy ?? '')
      ? query.sortBy!
      : 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
              {
                passportNumber: {
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
          assignments: true,
          tripParticipants: true,
        },
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      items: items.map((tourist) => this.toResponseDto(tourist)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<TouristResponseDto> {
    const tourist = await this.prisma.tourist.findFirst({
      where: { id, deletedAt: null },
      include: {
        assignments: true,
        tripParticipants: true,
      },
    });

    if (!tourist) {
      throw new NotFoundException('Tourist not found');
    }

    return this.toResponseDto(tourist);
  }

  async update(
    id: string,
    updateTouristDto: UpdateTouristDto,
  ): Promise<TouristResponseDto> {
    const tourist = await this.prisma.tourist.findFirst({
      where: { id, deletedAt: null },
    });

    if (!tourist) {
      throw new NotFoundException('Tourist not found');
    }

    if (updateTouristDto.email && updateTouristDto.email !== tourist.email) {
      const existingEmail = await this.prisma.tourist.findFirst({
        where: { email: updateTouristDto.email, deletedAt: null },
      });
      if (existingEmail) {
        throw new BadRequestException('Email already exists');
      }
    }

    if (
      updateTouristDto.passportNumber &&
      updateTouristDto.passportNumber !== tourist.passportNumber
    ) {
      const existingPassport = await this.prisma.tourist.findFirst({
        where: {
          passportNumber: updateTouristDto.passportNumber,
          deletedAt: null,
        },
      });
      if (existingPassport) {
        throw new BadRequestException('Passport number already exists');
      }
    }

    const password = updateTouristDto.password
      ? await this.passwordService.hash(updateTouristDto.password)
      : undefined;

    const updateData: any = {
      fullName: updateTouristDto.fullName,
      email: updateTouristDto.email,
      gender: updateTouristDto.gender,
      nationality: updateTouristDto.nationality,
      passportNumber: updateTouristDto.passportNumber,
      phoneNumber: updateTouristDto.phoneNumber,
    };

    if (password) updateData.password = password;
    if (updateTouristDto.birthDate) {
      updateData.birthDate = new Date(updateTouristDto.birthDate);
    }

    // Clean undefined values
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    const updatedTourist = await this.prisma.tourist.update({
      where: { id },
      data: updateData,
      include: {
        assignments: true,
        tripParticipants: true,
      },
    });

    return this.toResponseDto(updatedTourist);
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

  private toResponseDto(
    tourist: Tourist & {
      assignments?: Assignment[];
      tripParticipants?: TripParticipant[];
    },
  ): TouristResponseDto {
    return {
      id: tourist.id,
      fullName: tourist.fullName,
      email: tourist.email,
      gender: tourist.gender,
      birthDate: tourist.birthDate,
      nationality: tourist.nationality,
      passportNumber: tourist.passportNumber,
      phoneNumber: tourist.phoneNumber,
      isActive: tourist.isActive,
      createdAt: tourist.createdAt,
      updatedAt: tourist.updatedAt,
      assignmentCount: tourist.assignments?.length ?? 0,
      tripCount: tourist.tripParticipants?.length ?? 0,
    };
  }
}
