import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Team } from './team.entity';
import { Member } from './member.entity';
import { NoticeFile } from './notice-file.entity';
import { NoticeComment } from './notice-comment.entity';

@Entity()
export class Notice {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  noticeIdx: number;

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

  @ManyToOne(() => Member, (member) => member.notices)
  member: Member;
  @ManyToOne(() => Team, (team) => team.notices)
  team: Team;
  @OneToMany(() => NoticeFile, (file) => file.notice, { cascade: true })
  files: NoticeFile[];

  @OneToMany(() => NoticeComment, (comment) => comment.notice)
  comments: NoticeComment[];
  @ManyToMany(() => Member, (member) => member.noticeHits)
  @JoinTable({ name: 'notice_hit' })
  hits: Member[];
}
