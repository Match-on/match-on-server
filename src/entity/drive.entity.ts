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
import { DriveFile } from './drive-file.entity';
import { DriveComment } from './drive-comment.entity';
import { DriveFolder } from './drive-folder.entity';

@Entity()
export class Drive {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  driveIdx: number;

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

  @ManyToOne(() => Member, (member) => member.drives)
  member: Member;
  @ManyToOne(() => Team, (team) => team.drives)
  team: Team;
  @ManyToOne(() => DriveFolder, (folder) => folder.drives, { createForeignKeyConstraints: false })
  folder: DriveFolder;
  @OneToMany(() => DriveFile, (file) => file.drive, { cascade: true })
  files: DriveFile[];

  @OneToMany(() => DriveComment, (comment) => comment.drive)
  comments: DriveComment[];
  @ManyToMany(() => Member, (member) => member.driveHits)
  @JoinTable({ name: 'drive_hit' })
  hits: Member[];
}
