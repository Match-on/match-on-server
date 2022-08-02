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
import { Study } from './study.entity';
import { User } from './user.entity';

@Entity()
@Unique(['user', 'post'])
export class StudyResume {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  resumeIdx: number;

  @Column({ type: 'text' })
  body: string;

  @ManyToOne(() => User, (user) => user.studyResumes)
  user: User;
  @ManyToOne(() => Study, (post) => post.resumes)
  post: Study;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;
}
