import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import type { Request, Response } from 'express';
import { User } from 'src/user/user.entity';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  // 이메일, 비밀번호로 로그인
  @ApiBody({ type: LoginDto })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // LocalStrategy에서 반환한 user가 .user에 들어옴
    const user = req.user as User;
    const { accessToken, refreshToken } = await this.authService.issueTokens(
      user,
      {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      },
    );

    this.setRefreshCookie(res, refreshToken);
    return { accessToken };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = this.getRefreshCookie(req);
    if (!refreshToken)
      throw new UnauthorizedException('Not found refresh token');

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshTokens(refreshToken, {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      });

    this.setRefreshCookie(res, newRefreshToken);
    return { accessToken };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = this.getRefreshCookie(req);
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    this.clearRefreshCookie(res);
    return { ok: true };
  }

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  private getRefreshCookie(req: Request) {
    const cookieName = this.configService.getOrThrow<string>(
      'COOKIE_REFRESH_NAME',
    );
    return (req as any).cookies?.[cookieName];
  }

  private setRefreshCookie(res: Response, token: string) {
    const cookieName = this.configService.getOrThrow<string>(
      'COOKIE_REFRESH_NAME',
    );
    /**
     * 배포 환경이면 (https) secure = true + sameSite = None
     */
    const secure =
      (this.configService.get<string>('COOKIE_SECURE') ?? 'false') === 'true';
    const sameSite = this.configService.getOrThrow<string>(
      'COOKIE_SAME_SITE',
    ) as 'lax' | 'strict' | 'none';
    const domain = this.configService.get<string>('COOKIE_DOMAIN');

    res.cookie(cookieName, token, {
      httpOnly: true,
      secure,
      sameSite,
      domain,
      path: '/auth', // refresh 요청에만 쿠키가 가도록 제한
    });
  }

  private clearRefreshCookie(res: Response) {
    const cookieName = this.configService.getOrThrow<string>(
      'COOKIE_REFRESH_NAME',
    );
    res.clearCookie(cookieName, { path: '/auth' });
  }
}
