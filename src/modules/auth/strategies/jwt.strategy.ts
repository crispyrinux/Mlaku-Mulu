import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.accessSecret') ?? '',
    });
  }

  async validate(payload: JwtPayload) {
    const userType = payload.userType ?? 'EMPLOYEE';

    if (userType === 'EMPLOYEE') {
      const employee = await this.prisma.employee.findUnique({
        where: { id: payload.sub },
      });

      if (!employee || !employee.isActive) {
        throw new UnauthorizedException('Employee not found or inactive');
      }

      return { ...employee, userType: 'EMPLOYEE' };
    }

    if (userType === 'TOURIST') {
      const tourist = await this.prisma.tourist.findFirst({
        where: { id: payload.sub, deletedAt: null },
      });

      if (!tourist || tourist.status !== 'ACTIVE') {
        throw new UnauthorizedException('Tourist not found or inactive');
      }

      return { ...tourist, userType: 'TOURIST' };
    }

    throw new UnauthorizedException('Invalid token claims');
  }
}
