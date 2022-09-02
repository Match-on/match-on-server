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
import { Drive } from './drive.entity';
import { Team } from './team.entity';

@Entity()
export class DriveFolder {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  folderIdx: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'char', default: 'Y' })
  status: string;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;

  @ManyToOne(() => DriveFolder, (folder) => folder.childFolders)
  parentFolder: DriveFolder;
  @OneToMany(() => DriveFolder, (folder) => folder.parentFolder, { nullable: true })
  childFolders: DriveFolder[];

  @ManyToOne(() => Team, (team) => team.folders, { createForeignKeyConstraints: false })
  team: Team;
  @OneToMany(() => Drive, (drive) => drive.folder)
  drives: Drive[];
}
