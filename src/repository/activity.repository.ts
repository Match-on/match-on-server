import { ActivityCategory } from 'src/entity/activity-category.entity';
import { ActivityComment } from 'src/entity/activity-comment.entity';
import { ActivityHit } from 'src/entity/activity-hit.entity';
import { Activity } from 'src/entity/activity.entity';
import { createQueryBuilder, EntityRepository, In, Like, OrderByCondition, Repository } from 'typeorm';

@EntityRepository(Activity)
export class ActivityRepository extends Repository<Activity> {
  async findWithQuery(
    userIdx: number,
    sort: string,
    cursor: string,
    keyword?: string,
    categoryIdx?: number[],
  ): Promise<any> {
    let sortCondition: OrderByCondition = {};
    let cursorOption: string;
    const hitsQb = createQueryBuilder(ActivityHit, 'ah')
      .select('COUNT(*)')
      .where('ah.activityActivityIdx = a.activityIdx');
    const commentQb = createQueryBuilder(ActivityComment, 'ac')
      .select('COUNT(*)')
      .where('ac.activityActivityIdx = a.activityIdx');
    const favoriteQb = createQueryBuilder(Activity, 'af')
      .innerJoin('af.favorites', 'aff')
      .select('COUNT(*)')
      .where('af.activityIdx = a.activityIdx');

    if (sort == 'latest') {
      sortCondition = { 'a.createdAt': 'DESC', 'a.activityIdx': 'DESC' };
      cursorOption = "CONCAT(CAST(UNIX_TIMESTAMP(a.createdAt)AS UNSIGNED), LPAD(activityIdx, 8, '0'))";
    } else if (sort == 'popular') {
      const key = `((${hitsQb
        .andWhere('createdAt > DATE_ADD(now(), INTERVAL -7 DAY)')
        .getQuery()})+(${commentQb.getQuery()}))`;
      sortCondition[key] = 'DESC';
      sortCondition['a.activityIdx'] = 'DESC';
      cursorOption = `CONCAT(LPAD(${key}, 8, '0'), LPAD(activityIdx, 8, '0'))`;
    }
    const whereCondition = {};
    if (!!categoryIdx) {
      whereCondition['category'] = In(categoryIdx);
    }
    const qb = this.createQueryBuilder('a')
      .leftJoin('a.category', 'c')
      .leftJoin('a.favorites', 'f', `f.userIdx = ${userIdx}`)
      .where(whereCondition)
      .select([
        'a.activityIdx as activityIdx',
        'a.title as title',
        'left(a.body, 100) as body',
        'a.imageUrl as imageUrl',
        'a.startTime as startTime',
        'a.endTime as endTime',
      ])
      .addSelect(`group_concat(c.category) as category`)
      .addSelect('if(f.userIdx is null, 0, 1) as favorite')
      .addSelect(`(${hitsQb.getQuery()}) as hitCount`)
      .addSelect(`(${commentQb.getQuery()}) as commentCount`)
      .addSelect(`(${favoriteQb.getQuery()}) as favoriteCount`)
      .addSelect(cursorOption + ' as `cursor`')
      .groupBy('activityIdx')
      .orderBy(sortCondition)
      .limit(10);
    if (!!keyword) {
      qb.andWhere([{ title: Like(`%${keyword}%`) }, { body: Like(`%${keyword}%`) }]);
    }
    if (!!cursor) {
      qb.andWhere(cursorOption + ' < ' + `'${cursor}'`);
    }

    const activities = await qb.getRawMany();
    return activities;
  }

  async findFilter(): Promise<any> {
    const filter = await createQueryBuilder(ActivityCategory, 'ac').select(['categoryIdx', 'category']).getRawMany();
    return filter;
  }

  async upsertFavorite(userIdx: number, activityIdx: number): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into('favorite_activity')
      .values({ userUserIdx: userIdx, activityActivityIdx: activityIdx })
      .orIgnore()
      .execute();
  }

  async findFavorites(userIdx: number): Promise<any> {
    const sortCondition: OrderByCondition = { 'a.createdAt': 'DESC', 'a.activityIdx': 'DESC' };
    const cursorOption = "CONCAT(CAST(UNIX_TIMESTAMP(a.createdAt)AS UNSIGNED), LPAD(activityIdx, 8, '0'))";
    const hitsQb = createQueryBuilder(ActivityHit, 'ah')
      .select('COUNT(*)')
      .where('ah.activityActivityIdx = a.activityIdx');
    const commentQb = createQueryBuilder(ActivityComment, 'ac')
      .select('COUNT(*)')
      .where('ac.activityActivityIdx = a.activityIdx');
    const favoriteQb = createQueryBuilder(Activity, 'af')
      .leftJoin('af.favorites', 'aff')
      .select('COUNT(*)')
      .where('af.activityIdx = a.activityIdx');

    const activity = await this.createQueryBuilder('a')
      .innerJoin('a.favorites', 'u')
      .leftJoin('a.category', 'c')
      .where('u.userIdx = :userIdx', { userIdx })
      .select([
        'a.activityIdx as activityIdx',
        'a.title as title',
        'left(a.body, 100) as body',
        'a.imageUrl as imageUrl',
        'a.startTime as startTime',
        'a.endTime as endTime',
      ])
      .addSelect(`group_concat(c.category) as category`)
      .addSelect('1 as favorite')
      .addSelect(`(${hitsQb.getQuery()}) as hitCount`)
      .addSelect(`(${commentQb.getQuery()}) as commentCount`)
      .addSelect(`(${favoriteQb.getQuery()}) as favoriteCount`)
      .addSelect(cursorOption + ' as `cursor`')
      .groupBy('activityIdx')
      .orderBy(sortCondition)
      .getRawMany();
    return activity;
  }

  async deleteFavorite(userIdx: number, activityIdx: number): Promise<void> {
    await this.createQueryBuilder().relation('favorites').of({ activityIdx }).remove({ userIdx });
  }

  async upsertActivityHit(userIdx: number, activityIdx: number, date: string): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into('activity_hit')
      .values({ user: { userIdx }, activity: { activityIdx }, date })
      .updateEntity(false)
      .orIgnore()
      .execute();
  }

  // async findByIdx(userIdx: number, activityIdx: number): Promise<any> {
  //   const postQb = createQueryBuilder(ActivityPost, 'ap')
  //     .select('COUNT(*)')
  //     .where('ap.activityActivityIdx = a.activityIdx');

  //   const activity = this.createQueryBuilder('a')
  //     .where({ activityIdx })
  //     .leftJoin('a.favorites', 'f', `f.userIdx = ${userIdx}`)
  //     .select([
  //       'activityIdx',
  //       'title',
  //       'organizer',
  //       'target',
  //       'reward',
  //       'link',
  //       'startTime',
  //       'endTime',
  //       'body',
  //       'imageUrl',
  //       'category',
  //     ])
  //     .addSelect(`(${postQb.getQuery()}) as postCount`)
  //     .addSelect('if(f.userIdx is null, 0, 1) as favorite')
  //     .getRawAndEntities();

  //   return activity;
  // }

  async findComments(userIdx: number, activityIdx: number, cursor: string): Promise<any> {
    const cursorOption = "CONCAT(CAST(UNIX_TIMESTAMP(ac.createdAt)AS UNSIGNED), LPAD(ac.commentIdx, 8, '0'))";
    const sortCondition: OrderByCondition = { 'ac.createdAt': 'DESC', 'ac.commentIdx': 'DESC' };

    const qb = await this.createQueryBuilder('a')
      .leftJoin('a.comments', 'ac', 'a.activityIdx = ac.activityActivityIdx and ac.parentCommentCommentIdx IS NULL')
      .leftJoin('ac.user', 'acu')
      .leftJoin('ac.childComments', 'cc')
      .leftJoin('cc.user', 'ccu')
      .where({ activityIdx })
      .select([
        'a.activityIdx',
        'ac.commentIdx',
        'ac.comment',
        'ac.createdAt',
        'acu.userIdx',
        'acu.nickname',
        'acu.profileUrl',
        'cc.commentIdx',
        'cc.comment',
        'cc.createdAt',
        'ccu.userIdx',
        'ccu.nickname',
        'ccu.profileUrl',
      ])
      .addSelect(cursorOption + ' as `cursor`')
      .orderBy(sortCondition);

    if (!!cursor) {
      qb.andWhere(cursorOption + ' < ' + `'${cursor}'`);
    }
    const result = await qb.getRawAndEntities();

    return result;
  }
}
