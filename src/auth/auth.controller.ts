import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 이메일, 비밀번호로 로그인
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req) {
    // LocalStrategy에서 반환한 user가 req.user에 들어옴
    return this.authService.login(req.user);
  }

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
}
