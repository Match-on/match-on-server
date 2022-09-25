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
import { ActivityPost } from './activity-post.entity';
import { User } from './user.entity';

@Entity()
@Unique(['user', 'post'])
export class ActivityPostResume {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  resumeIdx: number;

  @Column({ type: 'text' })
  body: string;

  @ManyToOne(() => User, (user) => user.activityPostResumes)
  user: User;
  @ManyToOne(() => ActivityPost, (post) => post.resumes)
  post: ActivityPost;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;
}
