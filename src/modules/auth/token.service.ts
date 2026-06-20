import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import * as crypto from 'crypto';
import { PasswordService } from '../../common/security/password.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
  ) {}

  generateAccessToken(payload: JwtPayload): string {
    const secret = this.configService.get<string>('jwt.accessSecret') ?? '';
    const expiresIn =
      this.configService.get<string>('jwt.accessExpiresIn') ?? '15m';

    return this.jwtService.sign(
      { sub: payload.sub, role: payload.role, userType: payload.userType },
      { secret, expiresIn: expiresIn as any },
    );
  }

  async generateRefreshToken(): Promise<{
    refreshToken: string;
    refreshTokenHash: string;
  }> {
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenHash = await this.passwordService.hash(refreshToken);

    return { refreshToken, refreshTokenHash };
  }

  async verifyRefreshToken(
    rawToken: string,
    hashedToken: string,
  ): Promise<boolean> {
    return this.passwordService.compare(rawToken, hashedToken);
  }

  getRefreshTokenExpiry(): Date {
    return new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  }
}
