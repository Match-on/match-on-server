import { StudyComment } from 'src/entity/study-comment.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(StudyComment)
export class StudyCommentRepository extends Repository<StudyComment> {
  async insertComment(user: any, post: any, data: object, parentComment: any): Promise<StudyComment> {
    const comment: StudyComment = this.create(data);
    comment.user = user;
    comment.post = post;
    comment.parentComment = parentComment;
    const result: StudyComment = await this.save(comment);
    return result;
  }
}
