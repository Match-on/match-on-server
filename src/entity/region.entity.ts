import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Study } from './study.entity';

@Entity()
export class Region {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  regionIdx: number;

  @Column({ type: 'varchar', length: 10 })
  region: string;

  @OneToMany(() => Study, (post) => post.region)
  studies: Study[];
}
