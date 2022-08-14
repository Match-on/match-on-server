import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Team } from './team.entity';
import { Member } from './member.entity';
import { VoteComment } from './vote-comment.entity';
import { VoteChoice } from './vote-choice.entity';

@Entity()
export class Vote {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  voteIdx: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;
  @Column({ type: 'varchar', length: 1000 })
  description: string;
  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;
  @Column({ type: 'boolean', default: false })
  isMultiple: boolean;
  @Column({ type: 'boolean', default: false })
  isAnonymous: boolean;
  @Column({ type: 'boolean', default: false })
  isAddable: boolean;

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
  @OneToMany(() => VoteChoice, (choice) => choice.vote, { cascade: true })
  choices: VoteChoice[];

  @OneToMany(() => VoteComment, (comment) => comment.vote)
  comments: VoteComment[];
  @ManyToMany(() => Member, (member) => member.voteHits)
  @JoinTable({ name: 'vote_hit' })
  hits: Member[];
}
