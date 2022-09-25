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
import { ActivityPostComment } from './activity-post-comment.entity';
import { ActivityPostHit } from './activity-post-hit.entity';
import { ActivityPostResume } from './activity-post-resume.entity';
import { Activity } from './activity.entity';
import { User } from './user.entity';

@Entity()
export class ActivityPost {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  activityPostIdx: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;
  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'char', default: 'Y' })
  status: string;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;

  @ManyToOne(() => Activity, (activity) => activity.posts)
  activity: Activity;
  @ManyToOne(() => User, (user) => user.activityPosts)
  user: User;
  @OneToMany(() => ActivityPostHit, (hit) => hit.post)
  hits: ActivityPostHit[];
  @OneToMany(() => ActivityPostComment, (comment) => comment.post)
  comments: ActivityPostComment[];
  @OneToMany(() => ActivityPostResume, (resume) => resume.post)
  resumes: ActivityPostResume[];
}
