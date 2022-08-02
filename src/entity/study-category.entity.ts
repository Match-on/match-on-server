import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Study } from './study.entity';

@Entity()
export class StudyCategory {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  categoryIdx: number;

  @Column({ type: 'varchar', length: 20 })
  category: string;

  @OneToMany(() => Study, (post) => post.category)
  posts: Study[];
}
