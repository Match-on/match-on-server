import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn, Unique } from 'typeorm';
import { Activity } from './activity.entity';
import { User } from './user.entity';

@Entity()
@Unique(['user', 'activity', 'date'])
export class ActivityHit {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  date: string;

  @ManyToOne(() => User, (user) => user.activityHits, { createForeignKeyConstraints: false, primary: true })
  user: User;
  @ManyToOne(() => Activity, (activity) => activity.hits, { createForeignKeyConstraints: false, primary: true })
  activity: Activity;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
