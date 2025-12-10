import { Comment } from 'src/comment/comment.entity';
import { PostCategory, PostStatus } from 'src/common/enums';
import { User } from 'src/user/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  body: string;

  @Column({ default: PostStatus.published })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  category: PostCategory;

  @Column('text', { array: true, nullable: true })
  tags?: string[];

  // User랑 N:1 관계
  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Comment랑 1:N 관계
  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}
