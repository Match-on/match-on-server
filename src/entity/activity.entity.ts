import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ActivityCategory } from './activity-category.entity';
import { ActivityComment } from './activity-comment.entity';
import { ActivityHit } from './activity-hit.entity';
import { ActivityPost } from './activity-post.entity';
import { User } from './user.entity';

@Entity()
export class Activity {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  activityIdx: number;

  @Column({ type: 'varchar', length: 500 })
  title: string;
  @Column({ type: 'varchar', length: 300 })
  organizer: string;
  @Column({ type: 'varchar', length: 300 })
  target: string;
  @Column({ type: 'varchar', length: 100, nullable: true })
  reward: string;
  @Column({ type: 'varchar', length: 1000 })
  link: string;
  @Column({ type: 'timestamp', nullable: true })
  startTime: Date;
  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;
  @Column({ type: 'text' })
  body: string;
  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ type: 'char', default: 'Y' })
  status: string;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;

  @ManyToMany(() => User, (user) => user.favoriteActivity, { lazy: true })
  favorites: User[];
  @ManyToMany(() => ActivityCategory, (category) => category.activity, { lazy: true })
  @JoinTable({ name: 'activity_activity_category' })
  category: ActivityCategory[];
  @OneToMany(() => ActivityPost, (post) => post.activity, { lazy: true })
  posts: ActivityPost[];

  @OneToMany(() => ActivityHit, (hit) => hit.activity)
  hits: ActivityHit[];
  @OneToMany(() => ActivityComment, (comment) => comment.activity)
  comments: ActivityComment[];
}
