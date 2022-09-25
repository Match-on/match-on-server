import { ActivityComment } from 'src/entity/activity-comment.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(ActivityComment)
export class ActivityCommentRepository extends Repository<ActivityComment> {
  async insertComment(user: any, activity: any, data: object, parentComment: any): Promise<ActivityComment> {
    const comment: ActivityComment = this.create(data);
    comment.user = user;
    comment.activity = activity;
    comment.parentComment = parentComment;
    const result: ActivityComment = await this.save(comment);
    return result;
  }
}
