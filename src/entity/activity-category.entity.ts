import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Activity } from './activity.entity';

@Entity()
export class ActivityCategory {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  categoryIdx: number;

  @Column({ type: 'varchar', length: 20 })
  category: string;

  @ManyToMany(() => Activity, (activity) => activity.category)
  activity: Activity[];
}
