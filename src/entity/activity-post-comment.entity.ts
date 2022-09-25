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
import { ActivityPost } from './activity-post.entity';
import { User } from './user.entity';

@Entity()
export class ActivityPostComment {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  commentIdx: number;

  @Column({ type: 'text' })
  comment: string;

  @ManyToOne(() => User, (user) => user.activityPostComments)
  user: User;
  @ManyToOne(() => ActivityPost, (post) => post.comments)
  post: ActivityPost;

  @ManyToOne(() => ActivityPostComment, (comment) => comment.childComments)
  parentComment: ActivityPostComment;
  @OneToMany(() => ActivityPostComment, (comment) => comment.parentComment, { nullable: true })
  childComments: ActivityPostComment[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;
}
