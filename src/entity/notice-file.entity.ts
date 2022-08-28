import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Notice } from './notice.entity';

@Entity()
export class NoticeFile {
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

  @ManyToOne(() => Notice, (notice) => notice.files)
  notice: Notice;
}
