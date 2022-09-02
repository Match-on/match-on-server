import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Member } from './member.entity';
import { Drive } from './drive.entity';

@Entity()
export class DriveComment {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  commentIdx: number;

  @Column({ type: 'text' })
  comment: string;

  @ManyToOne(() => Member, (member) => member.driveComments)
  member: Member;
  @ManyToOne(() => Drive, (drive) => drive.comments)
  drive: Drive;

  @ManyToOne(() => DriveComment, (comment) => comment.childComments)
  parentComment: DriveComment;
  @OneToMany(() => DriveComment, (comment) => comment.parentComment, { nullable: true })
  childComments: DriveComment[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;
}
