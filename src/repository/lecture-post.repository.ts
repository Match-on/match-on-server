import { LecturePostComment } from 'src/entity/lecture-post-comment.entity';
import { LecturePostHit } from 'src/entity/lecture-post-hit.entity';
import { LecturePost } from 'src/entity/lecture-post.entity';
import { CreatePostDto } from 'src/lecture/dto/create-post.dto';
import { createQueryBuilder, EntityRepository, OrderByCondition, Repository } from 'typeorm';

@EntityRepository(LecturePost)
export class LecturePostRepository extends Repository<LecturePost> {
  async insertPost(user: any, lecture: any, createPostData: CreatePostDto): Promise<LecturePost> {
    const post: LecturePost = this.create(createPostData);
    if (post.type != 'free') post.isAnonymous = false;
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
  async findByIdx(userIdx: number, lecturePostIdx: number): Promise<{ entities: LecturePost[]; raw: any[] }> {
    const hitsQb = createQueryBuilder(LecturePostHit, 'lph')
      .select('COUNT(*)')
      .where('postLecturePostIdx = lp.lecturePostIdx');
    const commentQb = createQueryBuilder(LecturePostComment, 'lpc')
      .select('COUNT(*)')
      .where('postLecturePostIdx = lp.lecturePostIdx');

    const result = await this.createQueryBuilder('lp')
      .leftJoin('lp.user', 'u')
      .leftJoin('lp.comments', 'pc', 'lp.lecturePostIdx = pc.postLecturePostIdx and pc.parentCommentCommentIdx IS NULL')
      .leftJoin('pc.user', 'pcu')
      .leftJoin('pcu.lecturePostAnonynames', 'pca', `pca.postLecturePostIdx = ${lecturePostIdx}`)
      .leftJoin('pc.childComments', 'cc')
      .leftJoin('cc.user', 'ccu')
      .leftJoin('ccu.lecturePostAnonynames', 'cca', `cca.postLecturePostIdx = ${lecturePostIdx}`)
      .where({ lecturePostIdx })
      .select([
        'lp.title',
        'lp.body',
        'lp.createdAt',
        'pc.commentIdx',
        'pc.comment',
        'pc.createdAt',
        'pcu.nickname',
        'pcu.profileUrl',
        'pca.anonyname',
        'cc.commentIdx',
        'cc.comment',
        'cc.createdAt',
        'ccu.nickname',
        'ccu.profileUrl',
        'cca.anonyname',
      ])
      .addSelect(`if(isAnonymous, '익명', u.nickname) as writer`)
      .addSelect(`if(isAnonymous, null, u.profileUrl) as profileUrl`)
      .addSelect(`(${hitsQb.getQuery()}) as hitCount`)
      .addSelect(`(${commentQb.getQuery()}) as commentCount`)
      .addSelect(`if(u.userIdx = ${userIdx}, true, false) as isMe`)
      .addSelect(`lp.isAnonymous as isAnonymous`)
      .addSelect(`lp.type as type`)
      .getRawAndEntities();
    return result;
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
