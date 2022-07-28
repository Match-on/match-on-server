import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LectureRepository } from 'src/repository/lecture.repository';
import { LectureService } from './lecture.service';
import { LectureController } from './lecture.controller';
import { UserModule } from 'src/user/user.module';
import { LecturePostRepository } from 'src/repository/lecture-post.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LectureRepository, LecturePostRepository]), UserModule],
  providers: [LectureService],
  controllers: [LectureController],
})
export class LectureModule {}
