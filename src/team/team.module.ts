import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LectureModule } from 'src/lecture/lecture.module';
import { MemberRepository } from 'src/repository/member.repository';
import { TeamRepository } from 'src/repository/team.repository';
import { VoteCommentRepository, VoteRepository } from 'src/repository/vote.repository';
import { StudyModule } from 'src/study/study.module';
import { UserModule } from 'src/user/user.module';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { ScheduleRepository } from 'src/repository/schedule.repository';
import { NoteCommentRepository, NoteRepository } from 'src/repository/note.repository';
import { NoticeCommentRepository, NoticeRepository } from 'src/repository/notice.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TeamRepository,
      VoteRepository,
      VoteCommentRepository,
      ScheduleRepository,
      NoteRepository,
      NoteCommentRepository,
      NoticeRepository,
      NoticeCommentRepository,
    ]),
    TypeOrmModule.forFeature([MemberRepository]),
    UserModule,
    StudyModule,
    LectureModule,
  ],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}
