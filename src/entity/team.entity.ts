import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DriveFolder } from './drive-folder.entity';
import { Drive } from './drive.entity';
import { Member } from './member.entity';
import { Note } from './note.entity';
import { Notice } from './notice.entity';
import { User } from './user.entity';
import { Vote } from './vote.entity';

@Entity()
export class Team {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  teamIdx: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  id: string;
  @Column({ type: 'varchar', length: 50 })
  name: string;
  @Column({ type: 'varchar', length: 200, default: '' })
  description: string;
  @Column({ type: 'varchar', length: 20 })
  type: string;
  @Column({ type: 'timestamp', nullable: true })
  deadline: Date;

  @Column({ type: 'char', default: 'Y' })
  status: string;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;

  @OneToMany(() => Member, (member) => member.team)
  members: Member[];

  @ManyToMany(() => User, (user) => user.favoritTeams)
  favorites: User[];

  @OneToMany(() => Note, (note) => note.team)
  notes: Note[];
  @OneToMany(() => Vote, (vote) => vote.team)
  votes: Vote[];
  @OneToMany(() => Notice, (notice) => notice.team)
  notices: Notice[];
  @OneToMany(() => Drive, (drive) => drive.team)
  drives: Drive[];
  @OneToMany(() => DriveFolder, (folder) => folder.team)
  folders: Drive[];
}
