import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';

type PrismaKnownError = {
  code?: string;
};

@Catch()
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const prismaError = exception as PrismaKnownError;

    if (
      !prismaError?.code ||
      typeof prismaError.code !== 'string' ||
      !prismaError.code.startsWith('P')
    ) {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const mappedException = this.mapException(prismaError.code);
    const status = mappedException.getStatus();
    const payload = mappedException.getResponse();

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(typeof payload === 'string' ? { message: payload } : payload),
    });
  }

  private mapException(code: string): HttpException {
    switch (code) {
      case 'P2002':
        return new ConflictException('Unique constraint violation');
      case 'P2025':
        return new NotFoundException('Requested resource was not found');
      case 'P2003':
        return new BadRequestException('Foreign key constraint violation');
      default:
        return new InternalServerErrorException('Database operation failed');
    }
  }
}
