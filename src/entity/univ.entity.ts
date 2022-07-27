import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lecture } from './lecture.entity';
import { User } from './user.entity';

@Entity()
export class Univ {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  univIdx: number;

  @Column({ type: 'varchar', length: 20 })
  name: string;
  @Column({ type: 'varchar', length: 10, nullable: true })
  campus: string;
  @Column({ type: 'varchar', length: 10 })
  region: string;
  @Column({ type: 'varchar', length: 50, nullable: true })
  address: string;
  @Column({ type: 'varchar', length: 20 })
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

  @OneToMany(() => Lecture, (lecture) => lecture.univ)
  lectures: Lecture[];
}
