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
import { Study } from './study.entity';
import { User } from './user.entity';

@Entity()
export class StudyComment {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  commentIdx: number;

  @Column({ type: 'text' })
  comment: string;

  @ManyToOne(() => User, (user) => user.studyComments)
  user: User;
  @ManyToOne(() => Study, (post) => post.comments)
  post: Study;

  @ManyToOne(() => StudyComment, (comment) => comment.childComments)
  parentComment: StudyComment;
  @OneToMany(() => StudyComment, (comment) => comment.parentComment, { nullable: true })
  childComments: StudyComment[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;
}
