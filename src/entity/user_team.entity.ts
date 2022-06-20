import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Team } from './team.entity';
import { User } from './user.entity';

@Entity()
export class UserTeam {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  memberIdx: number;
  @ManyToOne(() => User, (user) => user.teams)
  user: User;
  @ManyToOne(() => Team, (team) => team.members)
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
