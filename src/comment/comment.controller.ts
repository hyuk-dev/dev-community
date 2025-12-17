import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommonResponse } from 'src/common/types/common-response.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // 게시글 댓글 불러오기
  @Get(':postId')
  find(@Param('postId') postId: number) {
    return this.commentService.find(postId);
  }

  // 댓글 생성
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Post(':postId')
  create(
    @Req() req,
    @Param('postId') postId: number,
    @Body() body: CreateCommentDto,
  ) {
    const { id: userId, email } = req.user;
    return this.commentService.create(postId, body, userId);
  }

  // 댓글 삭제
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Delete(':commentId')
  async delete(@Req() req, @Param('commentId') commentId: number): Promise<CommonResponse> {
    const { id: userId, email } = req.user;
    await this.commentService.delete(commentId, userId);
    return {
      statusCode: 204,
      message: "댓글이 삭제되었습니다."
    }
  }

  // 댓글 수정
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Patch(':commentId')
  async update(
    @Req() req,
    @Param('commentId') commentId: number,
    @Body() body: UpdateCommentDto,
  ): Promise<CommonResponse> {
    const { id: userId, email } = req.user;
    await this.commentService.update(commentId, userId, body);
    return {
      statusCode: 201,
      message: "댓글이 수정되었습니다."
    }
  }
}
