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
import { LecturePost } from './lecture-post.entity';
import { User } from './user.entity';

@Entity()
export class LecturePostComment {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  commentIdx: number;

  @Column({ type: 'text' })
  comment: string;

  @ManyToOne(() => User, (user) => user.lecturePostComments)
  user: User;
  @ManyToOne(() => LecturePost, (post) => post.comments)
  post: LecturePost;

  @ManyToOne(() => LecturePostComment, (comment) => comment.childComments)
  parentComment: LecturePostComment;
  @OneToMany(() => LecturePostComment, (comment) => comment.parentComment, { nullable: true })
  childComments: LecturePostComment[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;
}
