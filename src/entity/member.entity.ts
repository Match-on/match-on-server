import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Team } from './team.entity';
import { User } from './user.entity';

@Entity()
@Unique(['user', 'team'])
export class Member {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  memberIdx: number;
  @ManyToOne(() => User, (user) => user.teams, { createForeignKeyConstraints: false })
  user: User;
  @ManyToOne(() => Team, (team) => team.members, { createForeignKeyConstraints: false })
  team: Team;

  @Column({ type: 'varchar', length: 10, default: '팀원' })
  role: string;
  @Column({ type: 'varchar', length: 20 })
  name: string;
  @Column({ type: 'varchar', length: 50, default: '' })
  detail: string;

  @Column({ type: 'char', default: 'Y' })
  status: string;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;
}
