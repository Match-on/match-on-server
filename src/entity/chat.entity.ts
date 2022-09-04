import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  chatIdx: number;

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

  @ManyToOne(() => User, (user) => user.chatsSend)
  sender: User;
  @ManyToOne(() => User, (user) => user.chatsReceive)
  receiver: User;
}
