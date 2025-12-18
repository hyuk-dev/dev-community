import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { LoginDto } from "./login.dto";

export class CreateUserDto extends LoginDto{
  @ApiProperty({ example: 'test'})
  @IsString()
  username: string;
}