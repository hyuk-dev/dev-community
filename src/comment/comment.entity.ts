import { Exclude } from 'class-transformer';
import { Post } from 'src/post/post.entity';
import { User } from 'src/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  // User랑 N:1 관계
  @ManyToOne(() => User, (user) => user.comments, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @RelationId((comment: Comment) => comment.user)
  userId: number;

  // Post랑 N:1 관계
  @ManyToOne(() => Post, (post) => post.comments, { nullable: false })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @RelationId((comment: Comment) => comment.post)
  postId: number;
}
