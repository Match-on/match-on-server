import { ActivityPost } from 'src/entity/activity-post.entity';
import { CreatePostDto } from 'src/activity/dto/create-post.dto';
import { createQueryBuilder, EntityRepository, Like, OrderByCondition, Repository } from 'typeorm';
import { ActivityPostHit } from 'src/entity/activity-post-hit.entity';
import { ActivityPostComment } from 'src/entity/activity-post-comment.entity';
import { ActivityPostResume } from 'src/entity/activity-post-resume.entity';

@EntityRepository(ActivityPost)
export class ActivityPostRepository extends Repository<ActivityPost> {
  async insertPost(user: any, activity: any, createPostData: CreatePostDto): Promise<ActivityPost> {
    const post: ActivityPost = this.create(createPostData);
    post.user = user;
    post.activity = activity;
    const result: ActivityPost = await this.save(post);
    return result;
  }
  async findWithQuery(activityIdx: number, sort: string, cursor: string, keyword?: string): Promise<ActivityPost[]> {
    let sortCondition: OrderByCondition = {};
    let cursorOption: string;
    const hitsQb = createQueryBuilder(ActivityPostHit, 'aph')
      .select('COUNT(*)')
      .where('postActivityPostIdx = ap.activityPostIdx');
    const commentQb = createQueryBuilder(ActivityPostComment, 'apc')
      .select('COUNT(*)')
      .where('postActivityPostIdx = ap.activityPostIdx');

    if (sort == 'latest') {
      sortCondition = { 'ap.createdAt': 'DESC', 'ap.activityPostIdx': 'DESC' };
      cursorOption = "CONCAT(CAST(UNIX_TIMESTAMP(ap.createdAt)AS UNSIGNED), LPAD(activityPostIdx, 8, '0'))";
    } else if (sort == 'popular') {
      const key = `((${hitsQb
        .andWhere('createdAt > DATE_ADD(now(), INTERVAL -7 DAY)')
        .getQuery()})+(${commentQb.getQuery()}))`;
      sortCondition[key] = 'DESC';
      sortCondition['ap.activityPostIdx'] = 'DESC';
      cursorOption = `CONCAT(LPAD(${key}, 8, '0'), LPAD(activityPostIdx, 8, '0'))`;
    }

    const qb = this.createQueryBuilder('ap')
      .leftJoinAndSelect('ap.user', 'u')
      .where({ activity: activityIdx })
      .select(['activityPostIdx', 'title', 'left(body, 100) as body', 'ap.createdAt as createdAt'])
      .addSelect(`(${hitsQb.getQuery()}) as hitCount`)
      .addSelect(`(${commentQb.getQuery()}) as commentCount`)
      .addSelect(cursorOption + ' as `cursor`')
      .orderBy(sortCondition)
      .limit(10);
    if (!!keyword) {
      qb.andWhere([{ title: Like(`%${keyword}%`) }, { body: Like(`%${keyword}%`) }]);
    }
    if (!!cursor) {
      qb.andWhere(cursorOption + ' < ' + `'${cursor}'`);
    }

    const posts = await qb.getRawMany();
    return posts;
  }
  async findByIdx(userIdx: number, activityPostIdx: number): Promise<{ entities: ActivityPost[]; raw: any[] }> {
    const hitsQb = createQueryBuilder(ActivityPostHit, 'aph')
      .select('COUNT(*)')
      .where('postActivityPostIdx = ap.activityPostIdx');
    const commentQb = createQueryBuilder(ActivityPostComment, 'apc')
      .select('COUNT(*)')
      .where('postActivityPostIdx = ap.activityPostIdx');

    const result = await this.createQueryBuilder('ap')
      .leftJoin('ap.user', 'u')
      .leftJoin(
        'ap.comments',
        'pc',
        'ap.activityPostIdx = pc.postActivityPostIdx and pc.parentCommentCommentIdx IS NULL',
      )
      .leftJoin('pc.user', 'pcu')
      .leftJoin('pc.childComments', 'cc')
      .leftJoin('cc.user', 'ccu')
      .where({ activityPostIdx })
      .select([
        'u.userIdx as writerIdx',
        'ap.activityPostIdx',
        'ap.title',
        'ap.body',
        'ap.createdAt',
        'pc.commentIdx',
        'pc.comment',
        'pc.createdAt',
        'pcu.userIdx',
        'pcu.nickname',
        'pcu.profileUrl',
        'cc.commentIdx',
        'cc.comment',
        'cc.createdAt',
        'ccu.userIdx',
        'ccu.nickname',
        'ccu.profileUrl',
      ])
      .addSelect(`(${hitsQb.getQuery()}) as hitCount`)
      .addSelect(`(${commentQb.getQuery()}) as commentCount`)
      .addSelect(`if(u.userIdx = ${userIdx}, true, false) as isMe`)
      .addSelect(`if(ap.status = 'Y', true, false) as isRecruiting`)
      .getRawAndEntities();
    return result;
  }
  async upsertPostHit(userIdx: number, activityPostIdx: number, date: string): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into('activity_post_hit')
      .values({ user: { userIdx }, post: { activityPostIdx }, date })
      .updateEntity(false)
      .orIgnore()
      .execute();
  }

  async insertResume(user: any, post: any, body: string): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into('activity_post_resume')
      .values({ user, post, body })
      .updateEntity(false)
      .orIgnore()
      .execute();
  }
  async findResumes(activityPostIdx: number): Promise<ActivityPostResume[]> {
    const result = await createQueryBuilder(ActivityPostResume, 'apr')
      .where({ post: { activityPostIdx } })
      .leftJoin('apr.user', 'u')
      .select(['apr.body', 'u.userIdx', 'u.nickname', 'u.profileUrl'])
      .getMany();
    return result;
  }
}
