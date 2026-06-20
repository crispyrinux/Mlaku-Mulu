import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTouristDto } from './dto/create-tourist.dto';
import { UpdateTouristDto } from './dto/update-tourist.dto';
import { TouristQueryDto } from './dto/tourist-query.dto';
import { Prisma } from '@prisma/client';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { toPaginatedResponse } from '../../common/utils/pagination.util';
import { PasswordService } from '../../common/security/password.service';

@Injectable()
export class TouristsService {
  private readonly touristInclude = {
    passport: true,
    createdByEmployee: {
      select: { id: true, fullName: true },
    },
    updatedByEmployee: {
      select: { id: true, fullName: true },
    },
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async create(createTouristDto: CreateTouristDto, employeeId: string) {
    // Check passportNumber uniqueness
    const existingPassport = await this.prisma.passport.findUnique({
      where: { passportNumber: createTouristDto.passport.passportNumber },
    });

    if (existingPassport) {
      throw new ConflictException('Passport number already exists');
    }

    // Hash password
    const hashedPassword = await this.passwordService.hash(
      createTouristDto.password,
    );

    // Create tourist + passport in a transaction
    const tourist = await this.prisma.$transaction(async (tx) => {
      const newTourist = await tx.tourist.create({
        data: {
          fullName: createTouristDto.fullName,
          birthDate: new Date(createTouristDto.birthDate),
          gender: createTouristDto.gender,
          nationality: createTouristDto.nationality,
          email: createTouristDto.email,
          password: hashedPassword,
          phone: createTouristDto.phone,
          notes: createTouristDto.notes,
          createdByEmployeeId: employeeId,
        },
      });

      await tx.passport.create({
        data: {
          touristId: newTourist.id,
          passportNumber: createTouristDto.passport.passportNumber,
          issueDate: createTouristDto.passport.issueDate
            ? new Date(createTouristDto.passport.issueDate)
            : null,
          expiryDate: createTouristDto.passport.expiryDate
            ? new Date(createTouristDto.passport.expiryDate)
            : null,
          placeOfIssue: createTouristDto.passport.placeOfIssue,
        },
      });

      return tx.tourist.findUniqueOrThrow({
        where: { id: newTourist.id },
        include: this.touristInclude,
      });
    });

    return this.toResponse(tourist);
  }

  async findAll(query: TouristQueryDto): Promise<PaginatedResponse<any>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.TouristWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.tourist.count({ where }),
      this.prisma.tourist.findMany({
        where,
        include: this.touristInclude,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const responseItems = items.map((tourist) => this.toResponse(tourist));
    return toPaginatedResponse(responseItems, total, page, limit);
  }

  async findOne(id: string) {
    const tourist = await this.prisma.tourist.findFirst({
      where: { id, deletedAt: null },
      include: this.touristInclude,
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

    const password = updateTouristDto.password
      ? await this.passwordService.hash(updateTouristDto.password)
      : undefined;

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
        ...(password !== undefined ? { password } : {}),
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
      include: this.touristInclude,
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

  async findTripsForTourist(touristId: string) {
    const participants = await this.prisma.tripParticipant.findMany({
      where: { touristId },
      include: {
        trip: {
          include: {
            destination: true,
          },
        },
      },
      orderBy: {
        trip: {
          startDate: 'asc',
        },
      },
    });

    return participants.map((p) => ({
      tripId: p.trip.id,
      tripName: p.trip.name,
      tripDescription: p.trip.description,
      startDate: p.trip.startDate,
      endDate: p.trip.endDate,
      tripStatus: p.trip.status,
      destinationName: p.trip.destination.name,
      destinationCity: p.trip.destination.city,
      destinationCountry: p.trip.destination.country,
    }));
  }

  async findTripDetailsForTourist(touristId: string, tripId: string) {
    const participant = await this.prisma.tripParticipant.findFirst({
      where: {
        touristId,
        tripId,
      },
      include: {
        trip: {
          include: {
            destination: true,
          },
        },
      },
    });

    if (!participant) {
      throw new NotFoundException('Trip not found or not assigned to you');
    }

    return {
      tripId: participant.trip.id,
      tripName: participant.trip.name,
      tripDescription: participant.trip.description,
      startDate: participant.trip.startDate,
      endDate: participant.trip.endDate,
      tripStatus: participant.trip.status,
      destinationName: participant.trip.destination.name,
      destinationCity: participant.trip.destination.city,
      destinationCountry: participant.trip.destination.country,
    };
  }

  private toResponse(tourist: any) {
    return {
      id: tourist.id,
      fullName: tourist.fullName,
      birthDate: tourist.birthDate,
      gender: tourist.gender,
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
      passport: tourist.passport ?? null,
    };
  }
}
