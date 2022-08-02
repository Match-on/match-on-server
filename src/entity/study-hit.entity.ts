import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn, Unique } from 'typeorm';
import { Study } from './study.entity';
import { User } from './user.entity';

@Entity()
@Unique(['user', 'post', 'date'])
export class StudyHit {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  date: string;

  @ManyToOne(() => User, (user) => user.studyHits, { createForeignKeyConstraints: false, primary: true })
  user: User;
  @ManyToOne(() => Study, (post) => post.hits, { createForeignKeyConstraints: false, primary: true })
  post: Study;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
