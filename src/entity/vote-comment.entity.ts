import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Member } from './member.entity';
import { Vote } from './vote.entity';

@Entity()
export class VoteComment {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  commentIdx: number;

  @Column({ type: 'text' })
  comment: string;

  @ManyToOne(() => Member, (member) => member.voteComments)
  member: Member;
  @ManyToOne(() => Vote, (vote) => vote.comments)
  vote: Vote;

  @ManyToOne(() => VoteComment, (comment) => comment.childComments)
  parentComment: VoteComment;
  @OneToMany(() => VoteComment, (comment) => comment.parentComment, { nullable: true })
  childComments: VoteComment[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;
}
