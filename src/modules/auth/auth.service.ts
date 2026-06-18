import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PasswordService } from '../../common/security/password.service';
import { TokenService } from './token.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async login(loginDto: LoginDto): Promise<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; email: string; fullName: string; userType: JwtPayload['userType'] };
  }> {
    const employee = await this.prisma.employee.findUnique({ where: { email: loginDto.email } });
    const tourist = employee ? null : await this.prisma.tourist.findUnique({ where: { email: loginDto.email } });
    const user = employee ?? tourist;

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userType: JwtPayload['userType'] = employee ? 'EMPLOYEE' : 'TOURIST';
    const payload: JwtPayload = { sub: user.id, email: user.email, userType };

    const accessToken = this.tokenService.generateAccessToken(payload);
    const { refreshToken, refreshTokenHash } = await this.tokenService.generateRefreshToken(payload);

    await this.prisma.refreshToken.create({
      data: {
        userType,
        userId: user.id,
        tokenHash: refreshTokenHash,
        expiresAt: this.getRefreshTokenExpiry(),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        userType,
      },
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string; refreshToken: string }> {
    const storedTokens = await this.prisma.refreshToken.findMany({
      orderBy: { createdAt: 'desc' },
    });

    for (const storedToken of storedTokens) {
      const isTokenValid = await this.passwordService.compare(refreshTokenDto.refreshToken, storedToken.tokenHash);
      if (!isTokenValid) {
        continue;
      }

      const user =
        storedToken.userType === 'EMPLOYEE'
          ? await this.prisma.employee.findUnique({ where: { id: storedToken.userId } })
          : await this.prisma.tourist.findUnique({ where: { id: storedToken.userId } });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        userType: storedToken.userType,
      };

      const accessToken = this.tokenService.generateAccessToken(payload);
      const { refreshToken, refreshTokenHash } = await this.tokenService.generateRefreshToken(payload);

      await this.prisma.$transaction([
        this.prisma.refreshToken.delete({ where: { id: storedToken.id } }),
        this.prisma.refreshToken.create({
          data: {
            userType: storedToken.userType,
            userId: user.id,
            tokenHash: refreshTokenHash,
            expiresAt: this.getRefreshTokenExpiry(),
          },
        }),
      ]);

      return { accessToken, refreshToken };
    }

    throw new UnauthorizedException('Invalid refresh token');
  }

  async logout(refreshTokenDto: RefreshTokenDto): Promise<void> {
    const storedTokens = await this.prisma.refreshToken.findMany({
      orderBy: { createdAt: 'desc' },
    });

    for (const storedToken of storedTokens) {
      const isTokenValid = await this.passwordService.compare(refreshTokenDto.refreshToken, storedToken.tokenHash);
      if (isTokenValid) {
        await this.prisma.refreshToken.delete({ where: { id: storedToken.id } });
        return;
      }
    }

    throw new UnauthorizedException('Invalid refresh token');
  }

  private getRefreshTokenExpiry(): Date {
    return new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  }
}
