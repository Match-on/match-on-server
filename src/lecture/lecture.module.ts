import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LectureRepository } from 'src/repository/lecture.repository';
import { LectureService } from './lecture.service';
import { LectureController } from './lecture.controller';
import { UserModule } from 'src/user/user.module';
import { LecturePostRepository } from 'src/repository/lecture-post.repository';
import { LecturePostCommentRepository } from 'src/repository/lecture-post-comment.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([LectureRepository, LecturePostRepository, LecturePostCommentRepository]),
    UserModule,
  ],
  providers: [LectureService],
  controllers: [LectureController],
  exports: [LectureService],
})
export class LectureModule {}
