import { IsNumber, IsOptional } from "class-validator";

export class GetPostListDto {
  @IsNumber()
  @IsOptional()
  cursor?: number; // 마지막으로 본 Post의 Id

  @IsNumber()
  limit: number = 10;
}