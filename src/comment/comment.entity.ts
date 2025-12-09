import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  // User랑 N:1 관계
  // Post랑 N:1 관계
}
