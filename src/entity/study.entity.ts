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
import { Region } from './region.entity';
import { StudyCategory } from './study-category.entity';
import { StudyComment } from './study-comment.entity';
import { StudyHit } from './study-hit.entity';
import { StudyResume } from './study-resume.entity';
import { User } from './user.entity';

@Entity()
export class Study {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  studyIdx: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;
  @Column({ type: 'text' })
  body: string;
  @Column({ type: 'int', unsigned: true }) // 0 전체, 1 소속대학 재학생
  target: number;
  @Column({ type: 'int', unsigned: true }) // 모집 인원
  count: number;

  @Column({ type: 'char', default: 'Y' })
  status: string;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;

  @ManyToOne(() => User, (user) => user.studies)
  user: User;
  @ManyToMany(() => User, (user) => user.favoritStudies, { lazy: true })
  favorites: User[];
  @OneToMany(() => StudyHit, (hit) => hit.post)
  hits: StudyHit[];
  @OneToMany(() => StudyComment, (comment) => comment.post)
  comments: StudyComment[];
  @OneToMany(() => StudyResume, (resume) => resume.post)
  resumes: StudyResume[];
  @ManyToOne(() => StudyCategory, (category) => category.posts)
  category: StudyCategory;
  @ManyToOne(() => Region, (region) => region.studies)
  region: Region;
}
