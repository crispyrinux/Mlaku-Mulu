import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVisaApplicationDto } from './dto/create-visa-application.dto';
import { UpdateVisaApplicationDto } from './dto/update-visa-application.dto';
import { VisaApplicationQueryDto } from './dto/visa-application-query.dto';
import { UpdateVisaApplicationStatusDto } from './dto/update-visa-application-status.dto';
import { Prisma, VisaApplicationStatus } from '@prisma/client';

@Injectable()
export class VisaApplicationsService {
  private readonly visaApplicationInclude = {
    tourist: {
      include: {
        passport: true,
      },
    },
    createdByEmployee: {
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    },
    updatedByEmployee: {
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  private async generateApplicationNumber(
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `VA-${year}-`;

    const latest = await tx.visaApplication.findFirst({
      where: {
        applicationNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        applicationNumber: 'desc',
      },
    });

    let nextSeq = 1;
    if (latest) {
      const lastSeqStr = latest.applicationNumber.replace(prefix, '');
      const parsedSeq = parseInt(lastSeqStr, 10);
      if (!isNaN(parsedSeq)) {
        nextSeq = parsedSeq + 1;
      }
    }

    return `${prefix}${String(nextSeq).padStart(6, '0')}`;
  }

  async create(createDto: CreateVisaApplicationDto, employeeId: string) {
    const tourist = await this.prisma.tourist.findFirst({
      where: { id: createDto.touristId, deletedAt: null },
    });

    if (!tourist) {
      throw new NotFoundException('Tourist not found');
    }

    const application = await this.prisma.$transaction(async (tx) => {
      const appNum = await this.generateApplicationNumber(tx);
      return tx.visaApplication.create({
        data: {
          applicationNumber: appNum,
          touristId: createDto.touristId,
          country: createDto.country,
          visaType: createDto.visaType,
          status: VisaApplicationStatus.DRAFT,
          notes: createDto.notes,
          createdByEmployeeId: employeeId,
        },
        include: this.visaApplicationInclude,
      });
    });

    return this.toResponse(application);
  }

  async findAll(query: VisaApplicationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    const where: Prisma.VisaApplicationWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.country
        ? { country: { contains: query.country, mode: 'insensitive' } }
        : {}),
      ...(search
        ? {
            OR: [
              { applicationNumber: { contains: search, mode: 'insensitive' } },
              {
                tourist: {
                  fullName: { contains: search, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.visaApplication.count({ where }),
      this.prisma.visaApplication.findMany({
        where,
        include: this.visaApplicationInclude,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      items: items.map((app) => this.toResponse(app)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const application = await this.prisma.visaApplication.findFirst({
      where: { id, deletedAt: null },
      include: this.visaApplicationInclude,
    });

    if (!application) {
      throw new NotFoundException('Visa application not found');
    }

    return this.toResponse(application);
  }

  async update(
    id: string,
    updateDto: UpdateVisaApplicationDto,
    employeeId: string,
  ) {
    const application = await this.prisma.visaApplication.findFirst({
      where: { id, deletedAt: null },
    });

    if (!application) {
      throw new NotFoundException('Visa application not found');
    }

    if (application.status !== VisaApplicationStatus.DRAFT) {
      throw new BadRequestException(
        'Only visa applications in DRAFT status can be updated',
      );
    }

    const updated = await this.prisma.visaApplication.update({
      where: { id },
      data: {
        ...(updateDto.country !== undefined
          ? { country: updateDto.country }
          : {}),
        ...(updateDto.visaType !== undefined
          ? { visaType: updateDto.visaType }
          : {}),
        ...(updateDto.notes !== undefined ? { notes: updateDto.notes } : {}),
        updatedByEmployeeId: employeeId,
      },
      include: this.visaApplicationInclude,
    });

    return this.toResponse(updated);
  }

  async softDelete(id: string): Promise<void> {
    const application = await this.prisma.visaApplication.findFirst({
      where: { id, deletedAt: null },
    });

    if (!application) {
      throw new NotFoundException('Visa application not found');
    }

    await this.prisma.visaApplication.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async updateStatus(
    id: string,
    statusDto: UpdateVisaApplicationStatusDto,
    employeeId: string,
  ) {
    const application = await this.prisma.visaApplication.findFirst({
      where: { id, deletedAt: null },
    });

    if (!application) {
      throw new NotFoundException('Visa application not found');
    }

    const allowedTransitions: Record<
      VisaApplicationStatus,
      VisaApplicationStatus[]
    > = {
      [VisaApplicationStatus.DRAFT]: [
        VisaApplicationStatus.SUBMITTED,
        VisaApplicationStatus.CANCELLED,
      ],
      [VisaApplicationStatus.SUBMITTED]: [
        VisaApplicationStatus.IN_REVIEW,
        VisaApplicationStatus.CANCELLED,
      ],
      [VisaApplicationStatus.IN_REVIEW]: [
        VisaApplicationStatus.APPROVED,
        VisaApplicationStatus.REJECTED,
        VisaApplicationStatus.CANCELLED,
      ],
      [VisaApplicationStatus.APPROVED]: [],
      [VisaApplicationStatus.REJECTED]: [],
      [VisaApplicationStatus.CANCELLED]: [],
    };

    const allowed = allowedTransitions[application.status];
    if (!allowed.includes(statusDto.status)) {
      throw new BadRequestException(
        `Invalid status transition from ${application.status} to ${statusDto.status}`,
      );
    }

    const data: Prisma.VisaApplicationUncheckedUpdateInput = {
      status: statusDto.status,
      updatedByEmployeeId: employeeId,
    };

    if (statusDto.status === VisaApplicationStatus.SUBMITTED) {
      data.submissionDate = new Date();
    } else if (
      statusDto.status === VisaApplicationStatus.APPROVED ||
      statusDto.status === VisaApplicationStatus.REJECTED
    ) {
      data.decisionDate = new Date();
    }

    if (statusDto.notes !== undefined) {
      data.notes = statusDto.notes;
    }

    const updated = await this.prisma.visaApplication.update({
      where: { id },
      data,
      include: this.visaApplicationInclude,
    });

    return this.toResponse(updated);
  }

  private toResponse(app: any) {
    return {
      id: app.id,
      applicationNumber: app.applicationNumber,
      touristId: app.touristId,
      country: app.country,
      visaType: app.visaType,
      status: app.status,
      submissionDate: app.submissionDate,
      decisionDate: app.decisionDate,
      notes: app.notes,
      createdByEmployeeId: app.createdByEmployeeId,
      updatedByEmployeeId: app.updatedByEmployeeId,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      deletedAt: app.deletedAt,
      tourist: app.tourist ?? null,
      createdByEmployee: app.createdByEmployee ?? null,
      updatedByEmployee: app.updatedByEmployee ?? null,
    };
  }
}
