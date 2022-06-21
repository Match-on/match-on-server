import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserTeam } from './user_team.entity';

@Entity()
export class Team {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  teamIdx: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  id: string;
  @Column({ type: 'varchar', length: 10 })
  name: string;
  @Column({ type: 'varchar', length: 200, default: '' })
  description: string;
  @Column({ type: 'varchar', length: 20 })
  type: string;
  @Column({ type: 'timestamp', nullable: true })
  deadline: Date;

  @Column({ type: 'char', default: 'Y' })
  status: string;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;

  @OneToMany(() => UserTeam, (member) => member.team)
  members: UserTeam[];
}
