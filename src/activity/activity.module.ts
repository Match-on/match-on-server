import { Module } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { ActivityController } from './activity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityRepository } from 'src/repository/activity.repository';
import { ActivityPostRepository } from 'src/repository/activity-post.repository';
import { ActivityCommentRepository } from 'src/repository/activity-comment.repository';
import { ActivityPostCommentRepository } from 'src/repository/activity-post-comment.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActivityRepository,
      ActivityPostRepository,
      ActivityPostCommentRepository,
      ActivityCommentRepository,
    ]),
  ],
  providers: [ActivityService],
  controllers: [ActivityController],
})
export class ActivityModule {}
