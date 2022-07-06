import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Univ {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  univIdx: number;

  @Column({ type: 'varchar', length: 20 })
  name: string;
  @Column({ type: 'varchar', length: 50 })
  domain: string;

  @Column({ type: 'char', default: 'Y' })
  status: string;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;

  @OneToMany(() => User, (user) => user.univ)
  students: User[];
}
