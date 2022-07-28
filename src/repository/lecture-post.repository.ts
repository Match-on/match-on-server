import { LecturePostComment } from 'src/entity/lecture-post-comment.entity';
import { LecturePostHit } from 'src/entity/lecture-post-hit.entity';
import { LecturePost } from 'src/entity/lecture-post.entity';
import { CreatePostDto } from 'src/lecture/dto/create-post.dto';
import { createQueryBuilder, EntityRepository, OrderByCondition, Repository } from 'typeorm';

@EntityRepository(LecturePost)
export class LecturePostRepository extends Repository<LecturePost> {
  async insertPost(user: any, lecture: any, createPostData: CreatePostDto): Promise<LecturePost> {
    const post: LecturePost = this.create(createPostData);
    post.user = user;
    post.lecture = lecture;
    const result: LecturePost = await this.save(post);
    return result;
  }
  async findWithQuery(lectureIdx: number, type: string, sort: string, cursor: string): Promise<LecturePost[]> {
    let sortCondition: OrderByCondition = {};
    let cursorOption: string;
    const hitsQb = createQueryBuilder(LecturePostHit, 'lph')
      .select('COUNT(*)')
      .where('postLecturePostIdx = lp.lecturePostIdx');
    const commentQb = createQueryBuilder(LecturePostComment, 'lpc')
      .select('COUNT(*)')
      .where('postLecturePostIdx = lp.lecturePostIdx');

    if (sort == 'latest') {
      sortCondition = { 'lp.createdAt': 'DESC', 'lp.lecturePostIdx': 'DESC' };
      cursorOption = "CONCAT(CAST(UNIX_TIMESTAMP(lp.createdAt)AS UNSIGNED), LPAD(lecturePostIdx, 8, '0'))";
    } else if (sort == 'popular') {
      const key = `((${hitsQb
        .andWhere('createdAt > DATE_ADD(now(), INTERVAL -7 DAY)')
        .getQuery()})+(${commentQb.getQuery()}))`;
      sortCondition[key] = 'DESC';
      sortCondition['lp.lecturePostIdx'] = 'DESC';
      cursorOption = `CONCAT(LPAD(${key}, 8, '0'), LPAD(lecturePostIdx, 8, '0'))`;
    }

    const qb = await this.createQueryBuilder('lp')
      .leftJoinAndSelect('lp.user', 'u')
      .where({ lecture: lectureIdx, type: type })
      .select(['lecturePostIdx', 'title', 'left(body, 100) as body', 'lp.createdAt as createdAt'])
      .addSelect(`if(isAnonymous, '익명', u.nickname) as writer`)
      .addSelect(`if(isAnonymous, null, u.profileUrl) as profileUrl`)
      .addSelect(`(${hitsQb.getQuery()}) as hitCount`)
      .addSelect(`(${commentQb.getQuery()}) as commentCount`)
      .addSelect(cursorOption + ' as `cursor`')
      .orderBy(sortCondition)
      .limit(10);
    if (!!cursor) {
      qb.andWhere(cursorOption + ' < ' + `'${cursor}'`);
    }
    const posts = qb.getRawMany();
    return posts;
  }
  async findByIdx(userIdx: number, lecturePostIdx: number): Promise<LecturePost> {
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
