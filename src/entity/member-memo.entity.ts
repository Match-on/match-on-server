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

@Entity()
export class MemberMemo {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  memoIdx: number;
  @ManyToOne(() => Member, (member) => member.memos)
  member: Member;
  @Column({ type: 'varchar', length: 1001, default: '' })
  memo: string;

  @Column({ type: 'char', default: 'Y' })
  status: string;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;
}
