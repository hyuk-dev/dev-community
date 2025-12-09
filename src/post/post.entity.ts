import { PostCategory, PostStatus } from "src/common/enums";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

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

  @Column({ nullable: true })
  tags: string[] | null;

  // User랑 N:1 관계
  // Comment랑 1:N 관계
}