import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetPostListDto } from './dto/get-post-list.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@ApiTags('post')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiBearerAuth('access-token')
  @ApiBody({ type: CreatePostDto })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req, @Body() body: CreatePostDto) {
    const { id, email } = req.user;
    return this.postService.create(body, id);
  }

  @Get()
  find(@Query() query: GetPostListDto) {
    return this.postService.find(query);
  }

  @ApiParam({ name: 'id', type: Number, description: '게시글 ID'})
  @Get(':id')
  findOne(@Param('id') postId:number) {
    return this.postService.findOne(postId);
  }

  @ApiParam({ name: 'id', type: Number, description: '게시글 ID'})
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Req() req, @Param('id') postId:number) {
    const { id: userId, email } = req.user;
    return this.postService.delete(postId, userId);
  }

  @ApiParam({ name: 'id', type: Number, description: '게시글 ID'})
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Req() req,@Param('id') postId:number, @Body() body:UpdatePostDto) {
    const { id: userId, email } = req.user;
    return this.postService.update(postId, body, userId);
  }
}
