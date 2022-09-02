import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Drive } from './drive.entity';

@Entity()
export class DriveFile {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  fileIdx: number;

  @Column({ type: 'varchar', length: 1000 })
  fileName: string;
  @Column({ type: 'text' })
  url: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;

  @ManyToOne(() => Drive, (drive) => drive.files)
  drive: Drive;
}
