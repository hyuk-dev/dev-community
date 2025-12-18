import { BadRequestException, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-local';
import { AuthService } from "../auth.service";
import { User } from "src/user/user.entity";
import { plainToInstance } from "class-transformer";
import { LoginDto } from "../dto/login.dto";
import { validateOrReject } from "class-validator";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email'})
  }

  // LocalGuard가 실행될 때 호출
  async validate(email: string, password:string):Promise<User> {
    
    // 이메일, 비밀번호 검증
    const user = await this.authService.validateUser(email, password);
    return user;
  }
}