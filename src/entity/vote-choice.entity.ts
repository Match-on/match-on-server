import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Member } from './member.entity';
import { Vote } from './vote.entity';

@Entity()
export class VoteChoice {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  choiceIdx: number;

  @Column({ type: 'varchar', length: 100 })
  description: string;
  @Column({ type: 'text' })
  imageUrl: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;

  @ManyToOne(() => Vote, (vote) => vote.choices)
  vote: Vote;
  @ManyToMany(() => Member, (choice) => choice.voteChoices)
  member: Member[];
}
