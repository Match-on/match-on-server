import { ActivityPostComment } from 'src/entity/activity-post-comment.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(ActivityPostComment)
export class ActivityPostCommentRepository extends Repository<ActivityPostComment> {
  async insertComment(user: any, post: any, data: object, parentComment: any): Promise<ActivityPostComment> {
    const comment: ActivityPostComment = this.create(data);
    comment.user = user;
    comment.post = post;
    comment.parentComment = parentComment;
    const result: ActivityPostComment = await this.save(comment);
    return result;
  }
}
