import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class DatabaseHealthService {
  constructor(private readonly prisma: PrismaService) {}

  async checkConnection(): Promise<boolean> {
    try {
      await this.prisma.$connect();
      return true;
    } catch {
      return false;
    }
  }
}
