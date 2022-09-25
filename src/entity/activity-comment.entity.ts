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
import { Activity } from './activity.entity';
import { User } from './user.entity';

@Entity()
export class ActivityComment {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  commentIdx: number;

  @Column({ type: 'text' })
  comment: string;

  @ManyToOne(() => User, (user) => user.activityComments)
  user: User;
  @ManyToOne(() => Activity, (activity) => activity.comments)
  activity: Activity;

  @ManyToOne(() => ActivityComment, (comment) => comment.childComments)
  parentComment: ActivityComment;
  @OneToMany(() => ActivityComment, (comment) => comment.parentComment, { nullable: true })
  childComments: ActivityComment[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;
}
