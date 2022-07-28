import { Column, Entity, ManyToOne } from 'typeorm';
import { LecturePost } from './lecture-post.entity';
import { User } from './user.entity';

@Entity()
export class LecturePostAnonyname {
  @ManyToOne(() => User, (user) => user.lecturePostAnonynames, { createForeignKeyConstraints: false, primary: true })
  user: User;
  @ManyToOne(() => LecturePost, (post) => post.anonynames, { createForeignKeyConstraints: false, primary: true })
  post: LecturePost;
  @Column({ type: 'int', unsigned: true })
  anonyname: number;
}
