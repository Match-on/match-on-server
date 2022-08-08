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
import { NoteComment } from './note-comment.entity';
import { NoteTask } from './note-task.entity';
import { Note } from './note.entity';
import { Team } from './team.entity';
import { User } from './user.entity';

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
}
