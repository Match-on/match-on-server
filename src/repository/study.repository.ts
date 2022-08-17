import { StudyComment } from 'src/entity/study-comment.entity';
import { StudyHit } from 'src/entity/study-hit.entity';
import { StudyResume } from 'src/entity/study-resume.entity';
import { Study } from 'src/entity/study.entity';
import { createQueryBuilder, EntityRepository, In, Like, OrderByCondition, Repository } from 'typeorm';

@EntityRepository(Study)
export class StudyRepository extends Repository<Study> {
  async upsertFavorite(userIdx: number, studyIdx: number): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into('favorite_study')
      .values({ userUserIdx: userIdx, studyStudyIdx: studyIdx })
      .orIgnore()
      .execute();
  }
  async findFavorites(userIdx: number): Promise<Study[]> {
    const hitsQb = createQueryBuilder(StudyHit, 'sh').select('COUNT(*)').where('sh.postStudyIdx = s.studyIdx');
    const commentQb = createQueryBuilder(StudyComment, 'sc').select('COUNT(*)').where('sc.postStudyIdx = s.studyIdx');

    const studies = await this.createQueryBuilder('s')
      .leftJoin('s.category', 'c')
      .leftJoin('s.region', 'r')
      .innerJoin('s.favorites', 'u')
      .where('u.userIdx = :userIdx', { userIdx })
      .select([
        's.studyIdx as studyIdx',
        's.title as title',
        'c.category as category',
        'r.region as region',
        's.count as count',
      ])
      .addSelect(`(${hitsQb.getQuery()}) as hitCount`)
      .addSelect(`(${commentQb.getQuery()}) as commentCount`)
      .getRawMany();
    return studies;
  }
  async deleteFavorite(userIdx: number, studyIdx: number): Promise<void> {
    await this.createQueryBuilder().relation('favorites').of({ studyIdx }).remove({ userIdx });
  }
  async insertStudy(user: any, category: any, region: any, createStudyData: object): Promise<Study> {
    const study: Study = this.create(createStudyData);
    study.user = user;
    study.category = category;
    study.region = region;
    const result: Study = await this.save(study);
    return result;
  }
  async findWithQuery(
    sort: string,
    cursor: string,
    keyword?: string,
    categoryIdx?: number[],
    regionIdx?: number[],
  ): Promise<Study[]> {
    let sortCondition: OrderByCondition = {};
    let cursorOption: string;
    const hitsQb = createQueryBuilder(StudyHit, 'sh').select('COUNT(*)').where('sh.postStudyIdx = s.studyIdx');
    const commentQb = createQueryBuilder(StudyComment, 'sc').select('COUNT(*)').where('sc.postStudyIdx = s.studyIdx');

    if (sort == 'latest') {
      sortCondition = { 's.createdAt': 'DESC', 's.studyIdx': 'DESC' };
      cursorOption = "CONCAT(CAST(UNIX_TIMESTAMP(s.createdAt)AS UNSIGNED), LPAD(studyIdx, 8, '0'))";
    } else if (sort == 'popular') {
      const key = `((${hitsQb
        .andWhere('createdAt > DATE_ADD(now(), INTERVAL -7 DAY)')
        .getQuery()})+(${commentQb.getQuery()}))`;
      sortCondition[key] = 'DESC';
      sortCondition['s.studyIdx'] = 'DESC';
      cursorOption = `CONCAT(LPAD(${key}, 8, '0'), LPAD(studyIdx, 8, '0'))`;
    }
    const whereCondition = {};
    if (!!categoryIdx) {
      whereCondition['category'] = In(categoryIdx);
    }
    if (!!regionIdx) {
      whereCondition['region'] = In(regionIdx);
    }
    const qb = await this.createQueryBuilder('s')
      .leftJoin('s.category', 'c')
      .leftJoin('s.region', 'r')
      .where(whereCondition)
      .select(['studyIdx', 'title', 'left(body, 100) as body', 'r.region as region', 'c.category as category', 'count'])
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

    const posts = qb.getRawMany();
    return posts;
  }
  async findByIdx(userIdx: number, studyIdx: number): Promise<{ entities: Study[]; raw: any[] }> {
    const hitsQb = createQueryBuilder(StudyHit, 'sh').select('COUNT(*)').where('studyIdx = s.studyIdx');
    const commentQb = createQueryBuilder(StudyComment, 'comment').select('COUNT(*)').where('studyIdx = s.studyIdx');

    const result = await this.createQueryBuilder('s')
      .leftJoin('s.region', 'sr')
      .leftJoin('s.category', 'sca')
      .leftJoin('s.user', 'u')
      .leftJoin('s.favorites', 'sf', `sf.userIdx = ${userIdx}`)
      .leftJoin('s.comments', 'sc', 's.studyIdx = sc.post and sc.parentCommentCommentIdx IS NULL')
      .leftJoin('sc.user', 'scu')
      .leftJoin('sc.childComments', 'cc')
      .leftJoin('cc.user', 'ccu')
      .where({ studyIdx })
      .select([
        's.studyIdx',
        'u.userIdx as writerIdx',
        's.count',
        's.title',
        's.body',
        'sr.region as region',
        'sca.category as category',
        'sc.commentIdx',
        'sc.comment',
        'sc.createdAt',
        'scu.userIdx',
        'scu.nickname',
        'scu.profileUrl',
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
      .addSelect(`if(sf.userIdx IS NULL, false, true) as isLike`)
      .addSelect(`if(s.status = 'Y', true, false) as isRecruiting`)
      .getRawAndEntities();
    return result;
  }
  async upsertStudyHit(userIdx: number, studyIdx: number, date: string): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into('study_hit')
      .values({ user: { userIdx }, post: { studyIdx }, date })
      .updateEntity(false)
      .orIgnore()
      .execute();
  }

  async insertResume(user: any, post: any, body: string): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into('study_resume')
      .values({ user, post, body })
      .updateEntity(false)
      .orIgnore()
      .execute();
  }
  async findResumes(studyIdx: number): Promise<StudyResume[]> {
    const result = await createQueryBuilder(StudyResume, 'sr')
      .where({ post: { studyIdx } })
      .leftJoin('sr.user', 'u')
      .select(['sr.body', 'u.userIdx', 'u.nickname', 'u.profileUrl'])
      .getMany();
    return result;
  }
}
