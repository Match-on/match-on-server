import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyCommentRepository } from 'src/repository/study-comment.repository';
import { StudyRepository } from 'src/repository/study.repository';
import { UserModule } from 'src/user/user.module';
import { StudyController } from './study.controller';
import { StudyService } from './study.service';

@Module({
  imports: [TypeOrmModule.forFeature([StudyRepository, StudyCommentRepository]), UserModule],
  controllers: [StudyController],
  providers: [StudyService],
  exports: [StudyService],
})
export class StudyModule {}
