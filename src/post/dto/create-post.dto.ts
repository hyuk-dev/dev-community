import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { PostCategory } from 'src/common/enums';

export class CreatePostDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  body: string;

  @ApiProperty({ enum: PostCategory, enumName: 'PostCategory' })
  @IsEnum(PostCategory)
  category: PostCategory;

  @ApiProperty({ type: [String] })
  @IsString({ each: true })
  tags?: string[];
}
