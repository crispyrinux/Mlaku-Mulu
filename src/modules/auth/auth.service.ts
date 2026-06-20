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

  async login(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // 1. Try finding employee by email
    const employee = await this.prisma.employee.findUnique({
      where: { email: loginDto.email },
    });

    if (employee && employee.isActive && !employee.deletedAt) {
      // Verify employee password
      const isPasswordValid = await this.passwordService.compare(
        loginDto.password,
        employee.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Issue access token
      const payload: JwtPayload = { sub: employee.id, role: employee.role, userType: 'EMPLOYEE' };
      const accessToken = this.tokenService.generateAccessToken(payload);

      // Issue refresh token
      const { refreshToken, refreshTokenHash } =
        await this.tokenService.generateRefreshToken();

      await this.prisma.refreshToken.create({
        data: {
          employeeId: employee.id,
          tokenHash: refreshTokenHash,
          expiresAt: this.tokenService.getRefreshTokenExpiry(),
        },
      });

      return { accessToken, refreshToken };
    }

    // 2. Try finding tourist by email
    const tourist = await this.prisma.tourist.findFirst({
      where: { email: loginDto.email, deletedAt: null },
    });

    if (tourist && tourist.status === 'ACTIVE') {
      // Verify tourist password
      const isPasswordValid = await this.passwordService.compare(
        loginDto.password,
        tourist.password,
      );

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Issue access token
      const payload: JwtPayload = { sub: tourist.id, userType: 'TOURIST' };
      const accessToken = this.tokenService.generateAccessToken(payload);

      // Issue refresh token
      const { refreshToken, refreshTokenHash } =
        await this.tokenService.generateRefreshToken();

      await this.prisma.refreshToken.create({
        data: {
          touristId: tourist.id,
          tokenHash: refreshTokenHash,
          expiresAt: this.tokenService.getRefreshTokenExpiry(),
        },
      });

      return { accessToken, refreshToken };
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  async refresh(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // 1. Find all non-revoked, non-expired tokens
    const storedTokens = await this.prisma.refreshToken.findMany({
      where: { revokedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    for (const storedToken of storedTokens) {
      // 1. Validate token
      const isTokenValid = await this.tokenService.verifyRefreshToken(
        refreshTokenDto.refreshToken,
        storedToken.tokenHash,
      );

      if (!isTokenValid) {
        continue;
      }

      // Check if token is expired
      if (storedToken.expiresAt < new Date()) {
        // Revoke the expired token
        await this.prisma.refreshToken.update({
          where: { id: storedToken.id },
          data: { revokedAt: new Date() },
        });
        throw new UnauthorizedException('Refresh token has expired');
      }

      if (storedToken.employeeId) {
        // Verify employee still exists and is active
        const employee = await this.prisma.employee.findUnique({
          where: { id: storedToken.employeeId },
        });

        if (!employee || !employee.isActive || employee.deletedAt) {
          throw new UnauthorizedException('Employee not found or inactive');
        }

        // 2. Revoke old token
        await this.prisma.refreshToken.update({
          where: { id: storedToken.id },
          data: { revokedAt: new Date() },
        });

        // 3. Create new refresh token
        const { refreshToken: newRefreshToken, refreshTokenHash } =
          await this.tokenService.generateRefreshToken();

        await this.prisma.refreshToken.create({
          data: {
            employeeId: employee.id,
            tokenHash: refreshTokenHash,
            expiresAt: this.tokenService.getRefreshTokenExpiry(),
          },
        });

        // 4 & 5. Return new access token and new refresh token
        const payload: JwtPayload = { sub: employee.id, role: employee.role, userType: 'EMPLOYEE' };
        const accessToken = this.tokenService.generateAccessToken(payload);

        return { accessToken, refreshToken: newRefreshToken };
      } else if (storedToken.touristId) {
        // Verify tourist still exists and is active
        const tourist = await this.prisma.tourist.findFirst({
          where: { id: storedToken.touristId, deletedAt: null },
        });

        if (!tourist || tourist.status !== 'ACTIVE') {
          throw new UnauthorizedException('Tourist not found or inactive');
        }

        // 2. Revoke old token
        await this.prisma.refreshToken.update({
          where: { id: storedToken.id },
          data: { revokedAt: new Date() },
        });

        // 3. Create new refresh token
        const { refreshToken: newRefreshToken, refreshTokenHash } =
          await this.tokenService.generateRefreshToken();

        await this.prisma.refreshToken.create({
          data: {
            touristId: tourist.id,
            tokenHash: refreshTokenHash,
            expiresAt: this.tokenService.getRefreshTokenExpiry(),
          },
        });

        // 4 & 5. Return new access token and new refresh token
        const payload: JwtPayload = { sub: tourist.id, userType: 'TOURIST' };
        const accessToken = this.tokenService.generateAccessToken(payload);

        return { accessToken, refreshToken: newRefreshToken };
      }
    }

    throw new UnauthorizedException('Invalid refresh token');
  }

  async logout(userId: string, userType: 'EMPLOYEE' | 'TOURIST' = 'EMPLOYEE'): Promise<void> {
    if (userType === 'EMPLOYEE') {
      // Revoke all active refresh tokens for the current employee
      await this.prisma.refreshToken.updateMany({
        where: {
          employeeId: userId,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
    } else if (userType === 'TOURIST') {
      // Revoke all active refresh tokens for the current tourist
      await this.prisma.refreshToken.updateMany({
        where: {
          touristId: userId,
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });
    }
  }
}
