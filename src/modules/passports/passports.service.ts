import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePassportDto } from './dto/create-passport.dto';
import { UpdatePassportDto } from './dto/update-passport.dto';

@Injectable()
export class PassportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPassportDto: CreatePassportDto) {
    // Verify tourist exists and is not deleted
    const tourist = await this.prisma.tourist.findFirst({
      where: { id: createPassportDto.touristId, deletedAt: null },
    });

    if (!tourist) {
      throw new NotFoundException('Tourist not found');
    }

    // Check one passport per tourist
    const existingPassportForTourist = await this.prisma.passport.findUnique({
      where: { touristId: createPassportDto.touristId },
    });

    if (existingPassportForTourist) {
      throw new ConflictException('Tourist already has a passport');
    }

    // Check passportNumber uniqueness
    const existingPassportNumber = await this.prisma.passport.findUnique({
      where: { passportNumber: createPassportDto.passportNumber },
    });

    if (existingPassportNumber) {
      throw new ConflictException('Passport number already exists');
    }

    const passport = await this.prisma.passport.create({
      data: {
        touristId: createPassportDto.touristId,
        passportNumber: createPassportDto.passportNumber,
        issueDate: createPassportDto.issueDate
          ? new Date(createPassportDto.issueDate)
          : null,
        expiryDate: createPassportDto.expiryDate
          ? new Date(createPassportDto.expiryDate)
          : null,
        placeOfIssue: createPassportDto.placeOfIssue,
      },
      include: {
        tourist: {
          select: { id: true, fullName: true, nationality: true },
        },
      },
    });

    return passport;
  }

  async findOne(id: string) {
    const passport = await this.prisma.passport.findUnique({
      where: { id },
      include: {
        tourist: {
          select: { id: true, fullName: true, nationality: true },
        },
      },
    });

    if (!passport) {
      throw new NotFoundException('Passport not found');
    }

    return passport;
  }

  async update(id: string, updatePassportDto: UpdatePassportDto) {
    const passport = await this.prisma.passport.findUnique({
      where: { id },
    });

    if (!passport) {
      throw new NotFoundException('Passport not found');
    }

    const updatedPassport = await this.prisma.passport.update({
      where: { id },
      data: {
        ...(updatePassportDto.issueDate !== undefined
          ? { issueDate: new Date(updatePassportDto.issueDate) }
          : {}),
        ...(updatePassportDto.expiryDate !== undefined
          ? { expiryDate: new Date(updatePassportDto.expiryDate) }
          : {}),
        ...(updatePassportDto.placeOfIssue !== undefined
          ? { placeOfIssue: updatePassportDto.placeOfIssue }
          : {}),
      },
      include: {
        tourist: {
          select: { id: true, fullName: true, nationality: true },
        },
      },
    });

    return updatedPassport;
  }
}
