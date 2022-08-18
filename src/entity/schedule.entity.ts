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
import { Member } from './member.entity';

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  scheduleIdx: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;
  @Column({ type: 'varchar', length: 1000 })
  body: string;
  @Column({ type: 'timestamp' })
  startTime: Date;
  @Column({ type: 'timestamp' })
  endTime: Date;
  @Column({ type: 'varchar', length: 10 })
  color: string;

  @Column({ type: 'char', default: 'Y' })
  status: string;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;

  @ManyToOne(() => Member, (member) => member.notes)
  member: Member;
  @ManyToOne(() => Team, (team) => team.notes)
  team: Team;
}
