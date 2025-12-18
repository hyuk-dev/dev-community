import { User } from 'src/user/user.entity';
import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('refresh_sessions')
export class RefreshSession {
  @PrimaryGeneratedColumn('increment')
  id: number;

  // 한 유저가 여러 디바이스/브라우저에서 로그인할 수 있으니, 세션 테이블로 분리하는 게 운영에 유리
  @ManyToOne(() => User, (user) => user.refreshSessions, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Index()
  @Column()
  userId: number;

  // refreshToken 원문은 절대 DB에 저장하지 않고, "해시"만 저장한다.
  @Column({ name: 'token_hash'})
  tokenHash: string;

  // 토큰 만료 시간 (서버에서도 만료 시간을 체크하고, 관리할 수 있도록)
  @Column({ name: 'expires_at', type: 'timestamptz'})
  expiresAt: Date;

  // 로그아웃/강제 만료를 위한 revoke 처리
  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true})
  revokedAt: Date | null;

  // 어떤 환경에서 발급되었는지 (세션 관리에 도움)
  @Column({ name: 'user_agent', nullable: true})
  userAgent?: string;

  @Column({ name: 'ip', nullable: true})
  ip?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz'})
  createdAt: Date;
}
