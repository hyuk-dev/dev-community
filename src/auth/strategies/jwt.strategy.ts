import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // configService가 사용되지 않은 것처럼 보이는 건 VScode 인텔리센스의 한계
  constructor(private readonly configService: ConfigService) {
    super({
      // Authorization 헤더에서 Bearer 토큰 추출
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET_KEY') // configService 안불러와졌는데 괜찮을까?
    })
  }

  // 토큰이 유효하면 payload 반환
  async validate(payload: any) {
    return { id: payload.sub, email: payload.email }
  }
}