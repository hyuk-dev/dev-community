import { RefreshSession } from "src/auth/refresh-session.entity";
import { Comment } from "src/comment/comment.entity";
import { Post } from "src/post/post.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @CreateDateColumn()
  created_at: Date;

  // Post와 1:N 관계 설정
  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  // Comment와 1:N 관계 설정
  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  // RefreshSession과 1:N 관계 설정
  @OneToMany(() => RefreshSession, (refreshSession) => refreshSession.user)
  refreshSessions: RefreshSession[];
}