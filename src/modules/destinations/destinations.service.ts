import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import { DestinationQueryDto } from './dto/destination-query.dto';
import { Prisma } from '@prisma/client';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { toPaginatedResponse } from '../../common/utils/pagination.util';

@Injectable()
export class DestinationsService {
  private readonly destinationInclude = {
    _count: {
      select: { trips: true },
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  async create(createDestinationDto: CreateDestinationDto) {
    return this.prisma.destination.create({
      data: {
        name: createDestinationDto.name,
        description: createDestinationDto.description,
        country: createDestinationDto.country,
        city: createDestinationDto.city,
        isActive: createDestinationDto.isActive ?? true,
      },
      include: this.destinationInclude,
    });
  }

  async findAll(query: DestinationQueryDto): Promise<PaginatedResponse<any>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Prisma.DestinationWhereInput = {
      deletedAt: null,
      ...(query.country ? { country: { equals: query.country, mode: 'insensitive' as const } } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { city: { contains: search, mode: 'insensitive' as const } },
              { country: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.destination.count({ where }),
      this.prisma.destination.findMany({
        where,
        include: this.destinationInclude,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return toPaginatedResponse(items, total, page, limit);
  }

  async findOne(id: string) {
    const destination = await this.prisma.destination.findFirst({
      where: { id, deletedAt: null },
      include: this.destinationInclude,
    });

    if (!destination) {
      throw new NotFoundException('Destination not found');
    }

    return destination;
  }

  async update(id: string, updateDestinationDto: UpdateDestinationDto) {
    const destination = await this.prisma.destination.findFirst({
      where: { id, deletedAt: null },
    });

    if (!destination) {
      throw new NotFoundException('Destination not found');
    }

    return this.prisma.destination.update({
      where: { id },
      data: {
        ...(updateDestinationDto.name !== undefined ? { name: updateDestinationDto.name } : {}),
        ...(updateDestinationDto.description !== undefined ? { description: updateDestinationDto.description } : {}),
        ...(updateDestinationDto.country !== undefined ? { country: updateDestinationDto.country } : {}),
        ...(updateDestinationDto.city !== undefined ? { city: updateDestinationDto.city } : {}),
        ...(updateDestinationDto.isActive !== undefined ? { isActive: updateDestinationDto.isActive } : {}),
      },
      include: this.destinationInclude,
    });
  }

  async softDelete(id: string): Promise<void> {
    const destination = await this.prisma.destination.findFirst({
      where: { id, deletedAt: null },
    });

    if (!destination) {
      throw new NotFoundException('Destination not found');
    }

    await this.prisma.destination.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
