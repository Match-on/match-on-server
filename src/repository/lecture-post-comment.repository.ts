import { LecturePostComment } from 'src/entity/lecture-post-comment.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(LecturePostComment)
export class LecturePostCommentRepository extends Repository<LecturePostComment> {
  async insertComment(user: any, post: any, data: object, parentComment: any): Promise<LecturePostComment> {
    const comment: LecturePostComment = this.create(data);
    comment.user = user;
    comment.post = post;
    comment.parentComment = parentComment;
    const result: LecturePostComment = await this.save(comment);
    return result;
  }
  async initAnonyname(userIdx: number, lecturePostIdx: number): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into('lecture_post_anonyname')
      .values({
        user: { userIdx },
        post: { lecturePostIdx },
        anonyname: 0,
      })
      .orIgnore()
      .execute();
  }
  async insertAnonyname(userIdx: number, lecturePostIdx: number): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into('lecture_post_anonyname')
      .values({
        user: { userIdx },
        post: { lecturePostIdx },
        anonyname: () =>
          '(SELECT A.anonyname FROM(SELECT MAX(anonyname) + 1 as anonyname FROM lecture_post_anonyname WHERE postLecturePostIdx = :lecturePostIdx)AS A)',
      })
      .setParameter('lecturePostIdx', lecturePostIdx)
      .orIgnore()
      .execute();
  }

  async findByIdx(userIdx: number, lecturePostIdx: number): Promise<LecturePostComment> {
    const post = await this.createQueryBuilder('lp')
      .leftJoinAndSelect('lp.user', 'u')
      .where({ lecturePostIdx })
      .select(['lecturePostIdx', 'title', 'body', 'lp.createdAt'])
      .addSelect(`if(isAnonymous, '익명', u.nickname) as writer`)
      .addSelect(`if(isAnonymous, null, u.profileUrl) as profileUrl`)
      .addSelect(`if(userIdx = ${userIdx}, true, false) as isMe`)
      .getRawOne();
    return post;
  }
  async upsertPostHit(userIdx: number, lecturePostIdx: number, date: string): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into('lecture_post_hit')
      .values({ user: { userIdx }, post: { lecturePostIdx }, date })
      .updateEntity(false)
      .orIgnore()
      .execute();
  }
}
