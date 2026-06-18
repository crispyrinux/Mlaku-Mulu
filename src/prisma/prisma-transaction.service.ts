import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaTransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async execute<T>(operations: Promise<T>[]): Promise<T[]> {
    return this.prisma.$transaction(operations as never);
  }
}
