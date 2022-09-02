import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { DriveComment } from './drive-comment.entity';
import { Drive } from './drive.entity';
import { MemberMemo } from './member-memo.entity';
import { NoteComment } from './note-comment.entity';
import { NoteTask } from './note-task.entity';
import { Note } from './note.entity';
import { NoticeComment } from './notice-comment.entity';
import { Notice } from './notice.entity';
import { Team } from './team.entity';
import { User } from './user.entity';
import { VoteChoice } from './vote-choice.entity';
import { VoteComment } from './vote-comment.entity';
import { Vote } from './vote.entity';

@Entity()
@Unique(['user', 'team'])
export class Member {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  memberIdx: number;
  @ManyToOne(() => User, (user) => user.teams, { createForeignKeyConstraints: false })
  user: User;
  @ManyToOne(() => Team, (team) => team.members, { createForeignKeyConstraints: false })
  team: Team;
  @Column({ type: 'text', nullable: true })
  profileUrl: string;
  @Column({ type: 'varchar', length: 10, default: '팀원' })
  role: string;
  @Column({ type: 'varchar', length: 20 })
  name: string;
  @Column({ type: 'varchar', length: 50, default: '' })
  detail: string;

  @Column({ type: 'char', default: 'Y' })
  status: string;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;

  @OneToMany(() => Note, (note) => note.member)
  notes: Note[];
  @OneToMany(() => NoteTask, (noteTask) => noteTask.member)
  noteTasks: NoteTask[];
  @OneToMany(() => NoteComment, (comment) => comment.member)
  noteComments: NoteComment[];
  @ManyToMany(() => Note, (note) => note.hits)
  noteHits: Note[];

  @OneToMany(() => Vote, (vote) => vote.member)
  votes: Vote[];
  @OneToMany(() => VoteComment, (comment) => comment.member)
  voteComments: VoteComment[];
  @ManyToMany(() => Vote, (vote) => vote.hits)
  voteHits: Vote[];
  @ManyToMany(() => VoteChoice, (choice) => choice.member)
  voteChoices: VoteChoice[];

  @OneToMany(() => Notice, (notice) => notice.member)
  notices: Notice[];
  @OneToMany(() => NoticeComment, (comment) => comment.member)
  noticeComments: NoticeComment[];
  @ManyToMany(() => Notice, (notice) => notice.hits)
  noticeHits: Notice[];

  @OneToMany(() => MemberMemo, (memo) => memo.member)
  memos: MemberMemo[];

  @OneToMany(() => Drive, (drive) => drive.member)
  drives: Drive[];
  @OneToMany(() => DriveComment, (comment) => comment.member)
  driveComments: DriveComment[];
  @ManyToMany(() => Drive, (drive) => drive.hits)
  driveHits: Drive[];
}
