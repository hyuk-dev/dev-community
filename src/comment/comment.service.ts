import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async find(postId: number) {
    return await this.commentRepository.find({
      where: {
        post: {
          id: postId,
        },
      },
    });
  }

  async create(postId: number, dto: CreateCommentDto, userId: number) {
    const newComment = this.commentRepository.create({
      user: {
        id: userId,
      },
      content: dto.content,
      post: {
        id: postId,
      },
    });
    return await this.commentRepository.save(newComment);
  }

  async delete(commentId: number, userId: number) {
    await this.validate(commentId, userId);
    await this.commentRepository.delete({ id: commentId });
  }

  async update(commentId: number, userId: number, dto: UpdateCommentDto) {
    await this.validate(commentId, userId);
    await this.commentRepository.update(
      { id: commentId },
      {
        content: dto.content,
      },
    );
  }

  private async validate(commentId: number, userId: number) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
    });
    if (!comment) {
      throw new NotFoundException('댓글을 찾을 수 없습니다.');
    }
    if (comment?.userId !== userId) {
      throw new UnauthorizedException(
        '본인이 게시한 댓글만 삭제할 수 있습니다.',
      );
    }
  }
}
