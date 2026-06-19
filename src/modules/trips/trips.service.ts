import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripQueryDto } from './dto/trip-query.dto';
import { Prisma } from '@prisma/client';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { toPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class TripsService {
  private readonly tripInclude = {
    destination: true,
    _count: {
      select: { tripParticipants: true },
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  async create(createTripDto: CreateTripDto) {
    // Verify destination exists
    const destination = await this.prisma.destination.findFirst({
      where: { id: createTripDto.destinationId, deletedAt: null },
    });

    if (!destination) {
      throw new NotFoundException('Destination not found');
    }

    const trip = await this.prisma.trip.create({
      data: {
        name: createTripDto.name,
        description: createTripDto.description,
        destinationId: createTripDto.destinationId,
        startDate: new Date(createTripDto.startDate),
        endDate: new Date(createTripDto.endDate),
        status: createTripDto.status ?? 'DRAFT',
      },
      include: this.tripInclude,
    });

    return trip;
  }

  async findAll(query: TripQueryDto): Promise<PaginatedResponse<any>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.TripWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.destinationId ? { destinationId: query.destinationId } : {}),
      ...(search
        ? {
            OR: [{ name: { contains: search, mode: 'insensitive' as const } }],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.trip.count({ where }),
      this.prisma.trip.findMany({
        where,
        include: this.tripInclude,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return toPaginatedResponse(items, total, page, limit);
  }

  async findOne(id: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { id, deletedAt: null },
      include: this.tripInclude,
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return trip;
  }

  async update(id: string, updateTripDto: UpdateTripDto) {
    const trip = await this.prisma.trip.findFirst({
      where: { id, deletedAt: null },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    // If destinationId is being updated, verify it exists
    if (updateTripDto.destinationId) {
      const destination = await this.prisma.destination.findFirst({
        where: { id: updateTripDto.destinationId, deletedAt: null },
      });

      if (!destination) {
        throw new NotFoundException('Destination not found');
      }
    }

    const updatedTrip = await this.prisma.trip.update({
      where: { id },
      data: {
        ...(updateTripDto.name !== undefined
          ? { name: updateTripDto.name }
          : {}),
        ...(updateTripDto.description !== undefined
          ? { description: updateTripDto.description }
          : {}),
        ...(updateTripDto.destinationId !== undefined
          ? { destinationId: updateTripDto.destinationId }
          : {}),
        ...(updateTripDto.startDate !== undefined
          ? { startDate: new Date(updateTripDto.startDate) }
          : {}),
        ...(updateTripDto.endDate !== undefined
          ? { endDate: new Date(updateTripDto.endDate) }
          : {}),
        ...(updateTripDto.status !== undefined
          ? { status: updateTripDto.status }
          : {}),
      },
      include: this.tripInclude,
    });

    return updatedTrip;
  }

  async softDelete(id: string): Promise<void> {
    const trip = await this.prisma.trip.findFirst({
      where: { id, deletedAt: null },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    await this.prisma.trip.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
