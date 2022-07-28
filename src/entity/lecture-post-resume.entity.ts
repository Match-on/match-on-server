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
import { LecturePost } from './lecture-post.entity';
import { User } from './user.entity';

@Entity()
@Unique(['user', 'post'])
export class LecturePostResume {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  resumeIdx: number;

  @Column({ type: 'text' })
  body: string;

  @ManyToOne(() => User, (user) => user.lecturePostResumes)
  user: User;
  @ManyToOne(() => LecturePost, (post) => post.resumes)
  post: LecturePost;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;
}
