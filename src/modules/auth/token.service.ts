import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PasswordService } from '../../common/security/password.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly passwordService: PasswordService,
  ) {}

  generateAccessToken(payload: JwtPayload): string {
    const secret = this.configService.get<string>('jwt.accessSecret') ?? '';
    const expiresIn = this.configService.get<string>('jwt.accessExpiresIn') ?? '';

    return this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });
  }

  async generateRefreshToken(payload: JwtPayload): Promise<{ refreshToken: string; refreshTokenHash: string }> {
    const secret = this.configService.get<string>('jwt.refreshSecret') ?? '';
    const expiresIn = this.configService.get<string>('jwt.refreshExpiresIn') ?? '';
    const refreshToken = this.jwtService.sign(payload, {
      secret,
      expiresIn,
    });
    const refreshTokenHash = await this.passwordService.hash(refreshToken);

    return {
      refreshToken,
      refreshTokenHash,
    };
  }
}
