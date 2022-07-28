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
import { LecturePostHit } from './lecture-post-hit.entity';
import { Lecture } from './lecture.entity';
import { User } from './user.entity';

@Entity()
export class LecturePost {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  lecturePostIdx: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;
  @Column({ type: 'text' })
  body: string;
  @Column({ type: 'varchar', length: 10 })
  type: string;
  @Column({ type: 'boolean', default: false })
  isAnonymous: boolean;

  @Column({ type: 'char', default: 'Y' })
  status: string;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;

  @ManyToOne(() => Lecture, (lecture) => lecture.posts)
  lecture: Lecture;
  @ManyToOne(() => User, (user) => user.lecturePosts)
  user: User;
  @OneToMany(() => LecturePostHit, (hit) => hit.post)
  hits: LecturePostHit[];
}
