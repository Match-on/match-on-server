import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn, Unique } from 'typeorm';
import { ActivityPost } from './activity-post.entity';
import { User } from './user.entity';

@Entity()
@Unique(['user', 'post', 'date'])
export class ActivityPostHit {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  date: string;

  @ManyToOne(() => User, (user) => user.activityPostHits, { createForeignKeyConstraints: false, primary: true })
  user: User;
  @ManyToOne(() => ActivityPost, (post) => post.hits, { createForeignKeyConstraints: false, primary: true })
  post: ActivityPost;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
