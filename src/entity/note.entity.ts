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
import { NoteTask } from './note-task.entity';
import { NoteFile } from './note-file.entity';
import { NoteComment } from './note-comment.entity';

@Entity()
export class Note {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  noteIdx: number;

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

  @ManyToOne(() => Member, (member) => member.notes)
  member: Member;
  @ManyToOne(() => Team, (team) => team.notes)
  team: Team;
  @OneToMany(() => NoteTask, (task) => task.note, { cascade: true })
  tasks: NoteTask[];
  @OneToMany(() => NoteFile, (file) => file.note, { cascade: true })
  files: NoteFile[];

  @OneToMany(() => NoteComment, (comment) => comment.note)
  comments: NoteComment[];
  @ManyToMany(() => Member, (member) => member.noteHits)
  @JoinTable({ name: 'note_hit' })
  hits: Member[];
}
