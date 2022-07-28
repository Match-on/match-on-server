import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn, Unique } from 'typeorm';
import { LecturePost } from './lecture-post.entity';
import { User } from './user.entity';

@Entity()
@Unique(['user', 'post', 'date'])
export class LecturePostHit {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  date: string;

  @ManyToOne(() => User, (user) => user.lecturePostHits, { createForeignKeyConstraints: false, primary: true })
  user: User;
  @ManyToOne(() => LecturePost, (post) => post.hits, { createForeignKeyConstraints: false, primary: true })
  post: LecturePost;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
