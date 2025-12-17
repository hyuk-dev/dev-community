import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { GetPostListDto } from './dto/get-post-list.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CommonResponse } from 'src/common/types/common-response.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(dto: CreatePostDto, userId: number): Promise<Post> {
    const post = this.postRepository.create({
      title: dto.title,
      body: dto.body,
      category: dto.category,
      tags: dto.tags,
      user: { id: userId },
    });

    return this.postRepository.save(post);
  }

  async find(dto: GetPostListDto): Promise<Post[]> {
    const query = this.postRepository
      .createQueryBuilder('post')
      .orderBy('post.id', 'DESC')
      .limit(dto.limit);

    if (dto.cursor) {
      query.where('post.id < :cursor', { cursor: dto.cursor });
    }

    return await query.getMany();
  }

  async findOne(postId: number) {
    return await this.postRepository.findOne({ where: { id: postId } });
  }

  async delete(postId: number, userId: number): Promise<CommonResponse> {
    await this.validate(postId, userId);
    await this.postRepository.delete({ id: postId });

    return {
      message: "삭제되었습니다.",
      statusCode: 204
    }
  }

  async update(postId: number, dto: UpdatePostDto, userId: number) {
    await this.validate(postId, userId);
    await this.postRepository.update({ id: postId }, dto);

    return {
      message: "수정되었습니다.",
      statusCode: 201
    }
  }

  async validate(postId: number, userId: number) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if(!post) {
      throw new NotFoundException('존재하지 않는 게시물입니다.');
    }

    if(post.userId !== userId) {
      throw new UnauthorizedException('이 게시물에 대한 권한이 없습니다.');
    }
  }
}
