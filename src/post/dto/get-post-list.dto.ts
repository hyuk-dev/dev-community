import { IsNumber, IsOptional, Max, Min } from "class-validator";

export class GetPostListDto {
  @IsNumber()
  @IsOptional()
  cursor?: number; // 마지막으로 본 Post의 Id

  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 10;
}