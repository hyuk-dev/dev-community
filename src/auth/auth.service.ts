import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
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

  // 로그인 성공 시 JWT 발급
  async login(user: User) {
    const payload = { sub: user.id, email: user.email };

    // accessToken 생성
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
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
}
