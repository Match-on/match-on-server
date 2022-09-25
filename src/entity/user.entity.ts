import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { Member } from './member.entity';
import { Team } from './team.entity';
import { Univ } from './univ.entity';
import { Lecture } from './lecture.entity';
import { LecturePost } from './lecture-post.entity';
import { LecturePostHit } from './lecture-post-hit.entity';
import { LecturePostComment } from './lecture-post-comment.entity';
import { LecturePostAnonyname } from './lecture-post-anonyname.entity';
import { LecturePostResume } from './lecture-post-resume.entity';
import { Study } from './study.entity';
import { StudyHit } from './study-hit.entity';
import { StudyComment } from './study-comment.entity';
import { StudyResume } from './study-resume.entity';
import { Chat } from './chat.entity';
import { Activity } from './activity.entity';
import { ActivityPost } from './activity-post.entity';
import { ActivityPostHit } from './activity-post-hit.entity';
import { ActivityPostComment } from './activity-post-comment.entity';
import { ActivityPostResume } from './activity-post-resume.entity';
import { ActivityHit } from './activity-hit.entity';
import { ActivityComment } from './activity-comment.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  userIdx: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  id: string;
  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;
  @Column({ type: 'text', select: false })
  password: string;
  @Column({ type: 'varchar', length: 10 })
  name: string;
  @Column({ type: 'varchar', length: 20, unique: true })
  nickname: string;
  @Column({ type: 'text', nullable: true })
  profileUrl: string;
  @Column({ type: 'varchar', length: 5, nullable: true })
  countryCode: string;
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;
  @Column({ type: 'date', nullable: true })
  birth: Date;
  @Column({ type: 'boolean', default: true })
  emailAgree: boolean;
  @Column({ type: 'year', nullable: true, default: null })
  enrolledAt: number;

  @Column({ type: 'char', default: 'Y' })
  status: string;
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  accessedAt: Date;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;

  @OneToMany(() => Member, (member) => member.user)
  teams: Member[];

  @ManyToMany(() => Team, (team) => team.favorites)
  @JoinTable({ name: 'favorite_team' })
  favoritTeams: Team[];
  @ManyToMany(() => Lecture, (lecture) => lecture.favorites)
  @JoinTable({ name: 'favorite_lecture' })
  favoritLectures: Lecture[];

  @ManyToOne(() => Univ, (univ) => univ.students, { lazy: true })
  univ: Univ;
  @OneToMany(() => LecturePost, (post) => post.user)
  lecturePosts: LecturePost[];
  @OneToMany(() => LecturePostHit, (hit) => hit.user)
  lecturePostHits: LecturePostHit[];
  @OneToMany(() => LecturePostComment, (comment) => comment.user)
  lecturePostComments: LecturePostComment[];
  @OneToMany(() => LecturePostAnonyname, (anonyname) => anonyname.user)
  lecturePostAnonynames: LecturePostAnonyname[];
  @OneToMany(() => LecturePostResume, (resume) => resume.user)
  lecturePostResumes: LecturePostResume[];

  @OneToMany(() => Study, (post) => post.user)
  studies: Study[];
  @ManyToMany(() => Study, (study) => study.favorites)
  @JoinTable({ name: 'favorite_study' })
  favoritStudies: Study[];
  @OneToMany(() => StudyHit, (hit) => hit.user)
  studyHits: StudyHit[];
  @OneToMany(() => StudyComment, (comment) => comment.user)
  studyComments: StudyComment[];
  @OneToMany(() => StudyResume, (resume) => resume.user)
  studyResumes: StudyResume[];

  @ManyToMany(() => Activity, (activity) => activity.favorites)
  @JoinTable({ name: 'favorite_activity' })
  favoriteActivity: Activity[];
  @OneToMany(() => ActivityHit, (hit) => hit.user)
  activityHits: ActivityHit[];
  @OneToMany(() => ActivityComment, (comment) => comment.user)
  activityComments: ActivityComment[];
  @OneToMany(() => ActivityPost, (post) => post.user)
  activityPosts: ActivityPost[];
  @OneToMany(() => ActivityPostHit, (hit) => hit.user)
  activityPostHits: ActivityPostHit[];
  @OneToMany(() => ActivityPostComment, (comment) => comment.user)
  activityPostComments: ActivityPostComment[];
  @OneToMany(() => ActivityPostResume, (resume) => resume.user)
  activityPostResumes: ActivityPostResume[];

  @OneToMany(() => Chat, (chat) => chat.sender)
  chatsSend: Chat[];
  @OneToMany(() => Chat, (chat) => chat.receiver)
  chatsReceive: Chat[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    try {
      if (this.password) {
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;
      }
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
