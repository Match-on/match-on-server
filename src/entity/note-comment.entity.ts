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
import { Note } from './note.entity';

@Entity()
export class NoteComment {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  commentIdx: number;

  @Column({ type: 'text' })
  comment: string;

  @ManyToOne(() => Member, (member) => member.noteComments)
  member: Member;
  @ManyToOne(() => Note, (note) => note.comments)
  note: Note;

  @ManyToOne(() => NoteComment, (comment) => comment.childComments)
  parentComment: NoteComment;
  @OneToMany(() => NoteComment, (comment) => comment.parentComment, { nullable: true })
  childComments: NoteComment[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;
}
