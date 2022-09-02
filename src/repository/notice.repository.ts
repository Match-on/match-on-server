import { Member } from 'src/entity/member.entity';
import { NoticeComment } from 'src/entity/notice-comment.entity';
import { Notice } from 'src/entity/notice.entity';
import { createQueryBuilder, EntityRepository, Like, OrderByCondition, Repository } from 'typeorm';

@EntityRepository(Notice)
export class NoticeRepository extends Repository<Notice> {
  async insertNotice(member: Member, team: any, data: object, files: any[]): Promise<Notice> {
    const notice: Notice = this.create(data);
    notice.member = member;
    notice.team = team;
    notice.files = files;
    const result: Notice = await this.save(notice);
    return result;
  }

  async findNotices(teamIdx: number, memberIdx: number, sort: string, keyword?: string): Promise<any> {
    const commentQb = createQueryBuilder(NoticeComment, 'nc')
      .select('COUNT(*)')
      .where('nc.noticeNoticeIdx = n.noticeIdx');

    let sortCondition: OrderByCondition = {};
    if (sort == 'latest') {
      sortCondition = { 'n.createdAt': 'DESC', 'n.noticeIdx': 'DESC' };
    } else if (sort == 'alpha') {
      sortCondition = { 'n.title': 'ASC', 'n.noticeIdx': 'DESC' };
    }
    const qb = this.createQueryBuilder('n')
      .where({ team: { teamIdx } })
      .leftJoin('n.member', 'm')
      .leftJoin('notice_hit', 'n_h', 'n.noticeIdx = n_h.noticeNoticeIdx AND n_h.memberMemberIdx = :memberIdx', {
        memberIdx,
      })
      .leftJoin('n.files', 'f')
      .select(['noticeIdx', 'title', 'n.createdAt as createdAt', 'name'])
      .addSelect('if(n_h.memberMemberIdx IS NULL,true,false) as isNew')
      .addSelect(`(${commentQb.getQuery()}) as commentCount`)
      .addSelect(`group_concat(f.url separator ",") as files`)
      .groupBy('noticeIdx')
      .orderBy(sortCondition);

    if (!!keyword) {
      qb.andWhere([{ title: Like(`%${keyword}%`) }, { body: Like(`%${keyword}%`) }]);
    }
    const notices = qb.getRawMany();
    return notices;
  }

  async findNotice(memberIdx: number, noticeIdx: number): Promise<any> {
    const notices = this.createQueryBuilder('n')
      .where({ noticeIdx })
      .leftJoin('n.member', 'm')
      .leftJoin('n.team', 't')
      .leftJoin('n.files', 'f')
      .leftJoin('n.comments', 'nc', 'n.noticeIdx = nc.notice and nc.parentCommentCommentIdx IS NULL')
      .leftJoin('nc.member', 'ncm')
      .leftJoin('nc.childComments', 'cc')
      .leftJoin('cc.member', 'ccm')
      .select([
        'n.noticeIdx',
        'n.title',
        'n.body',
        'n.createdAt',
        'm.name',
        'f.fileName',
        'f.url',
        't.teamIdx',
        'nc.commentIdx',
        'nc.comment',
        'nc.createdAt',
        'ncm.memberIdx',
        'ncm.name',
        'ncm.profileUrl',
        'cc.commentIdx',
        'cc.comment',
        'cc.createdAt',
        'ccm.memberIdx',
        'ccm.name',
        'ccm.profileUrl',
      ])
      .addSelect(`if(n.memberMemberIdx = ${memberIdx}, true, false) as isMe`)
      .orderBy({ 'nc.createdAt': 'ASC', 'cc.createdAt': 'ASC' })
      .getRawAndEntities();
    return notices;
  }

  async upsertNoticeHit(memberIdx: number, noticeIdx: number): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into('notice_hit')
      .values({ memberMemberIdx: memberIdx, noticeNoticeIdx: noticeIdx })
      .updateEntity(false)
      .orIgnore()
      .execute();
  }
}

@EntityRepository(NoticeComment)
export class NoticeCommentRepository extends Repository<NoticeComment> {
  async insertComment(member: Member, notice: Notice, data: object, parentComment: any): Promise<NoticeComment> {
    const comment: NoticeComment = this.create(data);
    comment.member = member;
    comment.notice = notice;
    comment.parentComment = parentComment;
    const result: NoticeComment = await this.save(comment);
    return result;
  }
  async findComment(commentIdx: number): Promise<any> {
    const comment = await this.createQueryBuilder('c')
      .where({ commentIdx })
      .leftJoin('c.member', 'm')
      .select(['c.memberMemberIdx as memberIdx', 'm.userUserIdx as userIdx'])
      .getRawOne();
    return comment;
  }
}
