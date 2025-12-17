import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshSession } from './refresh-session.entity';
import { IsNull, Repository } from 'typeorm';
import { JwtPayload } from 'src/common/types/payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,

    @InjectRepository(RefreshSession)
    private readonly refreshRepository: Repository<RefreshSession>,
  ) {}

  // 유저 검증
  async validateUser(email: string, plainPassword: string): Promise<User> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('존재하지 않는 이메일입니다.');
    }

    // 평문 비밀번호와 해시된 비밀번호 비교
    const isMatch = await bcrypt.compare(plainPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
    }

    return user;
  }

  /**
   * AccessToken 발급
   * - JwtModule.registerAsync에 설정된 secret/expiresIn을 그대로 사용.
   */
  private signAccessToken(userId: number, email: string) {
    return this.jwtService.sign(
      { sub: userId, email }, // payload
      // accessToken은 기본 설정을 사용하기 때문에 옵션을 안넣어도 됨
    );
  }

  /**
   * RefreshToken 발급
   * accessToken과 secret이 다르므로 sign()할 때 옵션으로 override
   */
  private signRefreshToken(userId: number, email: string) {
    const secret = this.configService.getOrThrow<string>(
      'JWT_REFRESH_SECRET_KEY',
    );
    const expiresIn = this.configService.getOrThrow<string>(
      'JWT_REFRESH_EXPIRES_IN',
    ) as JwtSignOptions['expiresIn'];
    return this.jwtService.sign({ sub: userId }, { secret, expiresIn });
  }

  // RefreshToken 검증
  private verifyRefreshToken(token: string): JwtPayload {
    try {
      const secret = this.configService.getOrThrow<string>(
        'JWT_REFRESH_SECRET_KEY',
      );
      return this.jwtService.verify(token, { secret });
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // JWT 발급
  async issueTokens(user: User, meta?: { userAgent?: string; ip?: string }) {
    const payload = { sub: user.id, email: user.email };

    // accessToken 생성
    const accessToken = this.signAccessToken(payload.sub, payload.email);

    // refreshToken 생성
    const refreshToken = this.signRefreshToken(payload.sub, payload.email);

    // 리프레쉬 토큰을 해싱처리
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const decoded = this.jwtService.decode(refreshToken) as {
      exp?: number;
    } | null;
    const expiresAt =
      decoded?.exp !== undefined
        ? new Date(decoded.exp * 1000)
        : this.calcExpiresAt(
            this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN'),
          );

    // 세션 정보 DB에 저장
    const session = this.refreshRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
      revokedAt: null,
      userAgent: meta?.userAgent,
      ip: meta?.ip,
    });

    await this.refreshRepository.save(session);

    return {
      accessToken,
      refreshToken,
    };
  }

  // 회원가입
  async register(createUserDto: CreateUserDto) {
    const { email, password, username } = createUserDto;
    const existedUser = await this.userService.findByEmail(email);
    if (existedUser) {
      throw new ConflictException('이미 사용중인 이메일입니다.');
    }

    const newUser = await this.userService.createUser(
      email,
      password,
      username,
    );
    return newUser;
  }

  /**
   * refresh 토큰으로 access 토큰 새로 발급
   * - 1) 쿠키로 받은 refreshToken 검증
   * - 2) 해당 유저의 세션들 중 "hash compare"가 되는 세션을 찾음
   * - 3) 찾으면 새 access토큰 발급
   * - 4) refresh 토큰도 새로 발급하고 기존 세션은 revoke 후 세션 저장
   */
  async refreshTokens(
    refreshToken: string,
    meta?: { userAgent?: string; ip?: string },
  ) {
    const payload = this.verifyRefreshToken(refreshToken);
    const { sub: userId, email } = payload;

    // 해당 유저의 '활성 세션'들을 가져옵니다.
    // - 규모가 커지면 userId + revokedAt is null + expiresAt 조건으로 인덱싱
    const sessions = await this.refreshRepository.find({
      where: { userId, revokedAt: IsNull() },
    });

    // 받은 refreshToken 원문과 DB의 hash를 비교해서 어떤 세션인지 찾기
    let matched: RefreshSession | null = null;
    for (const s of sessions) {
      const ok = await bcrypt.compare(refreshToken, s.tokenHash);
      if (ok) {
        matched = s;
        break;
      }
    }

    if (!matched) {
      // 정책에 따라 해당 유저의 세션 전체를 revoke 하는 방법도 존재
      throw new UnauthorizedException('Refresh session not found');
    }

    if (matched.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Refresh session expired');
    }

    const newAccessToken = this.signAccessToken(userId, email);

    // refresh 로테이션: 새 refreshToken 발급 + 기존 세션 revoke + 새 세션 저장
    const newRefreshToken = this.signRefreshToken(userId, email);
    const newHash = await bcrypt.hash(newRefreshToken, 10);
    const newExpiresAt = this.calcExpiresAt(
      this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN'),
    );

    // 기존 세션 revoke 처리
    matched.revokedAt = new Date();
    await this.refreshRepository.save(matched);

    // 새 세션 생성
    const newSession = this.refreshRepository.create({
      userId,
      tokenHash: newHash,
      expiresAt: newExpiresAt,
      revokedAt: null,
      userAgent: meta?.userAgent,
      ip: meta?.ip,
    });
    await this.refreshRepository.save(newSession);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * 로그아웃
   */
  async logout(refreshToken: string) {
    const payload = this.verifyRefreshToken(refreshToken);
    const userId = payload.sub;
    const sessions = await this.refreshRepository.find({
      where: { userId, revokedAt: IsNull() },
    });

    for (const s of sessions) {
      const ok = await bcrypt.compare(refreshToken, s.tokenHash);
      if (ok) {
        s.revokedAt = new Date();
        await this.refreshRepository.save(s);
        return;
      }
    }

    // 일단 로그아웃/만료된 토큰이어도 조용히 종료되게 할 건데, 정책상 UnauthorizedException 써도 됨
  }

  /**
   * expiresIn 문자열(예: "30d", "15m")을 받아서 만료 Date를 계산
   * - 정교하게 하려면 ms 라이브러리를 쓰는 게 편해요. 여기선 최소 구현.
   * - By ChatGPT
   */
  private calcExpiresAt(expiresIn: string): Date {
    const now = Date.now();

    const m = expiresIn.match(/^(\d+)([smhd])$/); // seconds/minutes/hours/days
    if (!m) return new Date(now + 30 * 24 * 60 * 60 * 1000); // fallback: 30d

    const value = Number(m[1]);
    const unit = m[2];

    const mult =
      unit === 's'
        ? 1000
        : unit === 'm'
          ? 60 * 1000
          : unit === 'h'
            ? 60 * 60 * 1000
            : 24 * 60 * 60 * 1000;

    return new Date(now + value * mult);
  }
}
