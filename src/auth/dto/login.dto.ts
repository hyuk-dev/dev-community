import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'test@test.com'})
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'abc12345!', minLength: 8})
  @MinLength(8)
  password: string;
}
