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
import { Member } from './member.entity';
import { User } from './user.entity';

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
}
