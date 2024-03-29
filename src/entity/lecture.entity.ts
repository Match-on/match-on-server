import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LecturePost } from './lecture-post.entity';
import { Univ } from './univ.entity';
import { User } from './user.entity';

@Entity()
export class Lecture {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  lectureIdx: number;

  @Column({ type: 'int', unsigned: true })
  year: number;
  @Column({ type: 'tinyint', unsigned: true })
  semester: number;
  @Column({ type: 'int', unsigned: true })
  grade: number;
  @Column({ type: 'varchar', length: 10 })
  type: string;
  @Column({ type: 'varchar', length: 10 })
  code: string;
  @Column({ type: 'varchar', length: 10 })
  classNumber: string;
  @Column({ type: 'varchar', length: 100 })
  name: string;
  @Column({ type: 'int', unsigned: true })
  credit: string;
  @Column({ type: 'varchar', length: 30, nullable: true })
  time: string;
  @Column({ type: 'varchar', length: 20, nullable: true })
  department: string;
  @Column({ type: 'varchar', length: 10, nullable: true })
  instructor: string;

  @Column({ type: 'char', default: 'Y' })
  status: string;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;

  @ManyToOne(() => Univ, (univ) => univ.lectures)
  univ: Univ;
  @ManyToMany(() => User, (user) => user.favoritLectures, { lazy: true })
  favorites: User[];
  @OneToMany(() => LecturePost, (post) => post.lecture)
  posts: LecturePost[];
}
