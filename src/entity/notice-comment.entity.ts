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
import { Notice } from './notice.entity';

@Entity()
export class NoticeComment {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  commentIdx: number;

  @Column({ type: 'text' })
  comment: string;

  @ManyToOne(() => Member, (member) => member.noticeComments)
  member: Member;
  @ManyToOne(() => Notice, (notice) => notice.comments)
  notice: Notice;

  @ManyToOne(() => NoticeComment, (comment) => comment.childComments)
  parentComment: NoticeComment;
  @OneToMany(() => NoticeComment, (comment) => comment.parentComment, { nullable: true })
  childComments: NoticeComment[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;
}
