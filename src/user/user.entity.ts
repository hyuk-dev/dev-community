import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

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
  // Comment와 1:N 관계 설정
}