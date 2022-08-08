import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Member } from './member.entity';
import { Note } from './note.entity';

@Entity()
export class NoteTask {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  taskIdx: number;

  @Column({ type: 'varchar', length: 100 })
  description: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;

  @ManyToOne(() => Note, (note) => note.tasks)
  note: Note;
  @ManyToOne(() => Member, (member) => member.noteTasks, { createForeignKeyConstraints: false })
  member: Member;
}
