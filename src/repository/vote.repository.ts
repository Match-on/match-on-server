import { Member } from 'src/entity/member.entity';
import { VoteComment } from 'src/entity/vote-comment.entity';
import { Vote } from 'src/entity/vote.entity';
import { CreateVoteChoiceDto } from 'src/team/dto/create-vote-choice.dto';
import { createQueryBuilder, EntityRepository, In, Like, OrderByCondition, Repository } from 'typeorm';

@EntityRepository(Vote)
export class VoteRepository extends Repository<Vote> {
  async insertVote(member: Member, team: any, data: object): Promise<Vote> {
    const vote: Vote = this.create(data);
    vote.member = member;
    vote.team = team;
    const result: Vote = await this.save(vote);
    return result;
  }

  async upsertVoteHit(memberIdx: number, voteIdx: number): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into('vote_hit')
      .values({ memberMemberIdx: memberIdx, voteVoteIdx: voteIdx })
      .updateEntity(false)
      .orIgnore()
      .execute();
  }
  async findVotes(team: any, member: Member, sort: string, keyword?: string): Promise<any[]> {
    const memberQb = createQueryBuilder(Member, 'm').select('COUNT(*)').where('m.teamTeamIdx = v.teamTeamIdx');

    let sortCondition: OrderByCondition = {};
    if (sort == 'latest') {
      sortCondition = { 'v.createdAt': 'DESC', 'v.voteIdx': 'DESC' };
    } else if (sort == 'alpha') {
      sortCondition = { 'v.title': 'ASC', 'v.voteIdx': 'DESC' };
    }
    const votesQb = this.createQueryBuilder('v')
      .leftJoin('vote_hit', 'v_h', 'v.voteIdx = v_h.voteVoteIdx AND v_h.memberMemberIdx = :memberIdx', {
        memberIdx: member.memberIdx,
      })
      .leftJoin('v.choices', 'vc')
      .leftJoin('vc.member', 'vcm')
      .where({ team: team })
      .select(['v.voteIdx as voteIdx', 'v.title as title', 'v.endTime as endTime'])
      .addSelect('if(v_h.memberMemberIdx IS NULL,true,false) as isNew')
      .addSelect(`CONCAT(COUNT(DISTINCT vcm.memberIdx), "/", (${memberQb.getQuery()})) as count`)
      .groupBy('v.voteIdx')
      .orderBy(sortCondition);
    if (!!keyword) {
      votesQb.andWhere([{ title: Like(`%${keyword}%`) }, { body: Like(`%${keyword}%`) }]);
    }
    const result = votesQb.getRawMany();
    return result;
  }
  async findVote(voteIdx: number, memberIdx: number): Promise<any> {
    const memberQb = createQueryBuilder(Member, 'm').select('COUNT(*)').where('m.teamTeamIdx = v.teamTeamIdx');
    const choicesQb = this.createQueryBuilder('v_2')
      .where({ voteIdx })
      .leftJoin('v_2.choices', 'vc_2')
      .leftJoin('vc_2.member', 'vcm_2')
      .select('COUNT(DISTINCT vcm_2.memberIdx)');

    const result = this.createQueryBuilder('v')
      .where({ voteIdx })
      .leftJoin('v.comments', 'vc', 'v.voteIdx = vc.vote and vc.parentCommentCommentIdx IS NULL')
      .leftJoin('vc.member', 'vcm')
      .leftJoin('vc.childComments', 'cc')
      .leftJoin('cc.member', 'ccm')
      .leftJoin('v.choices', 'choice')
      .leftJoin('choice.member', 'choice_member')
      .select([
        'v.voteIdx',
        'v.title',
        'v.description',
        'v.endTime',
        'v.isMultiple',
        'v.isAnonymous',
        'v.isAddable',
        'choice.choiceIdx',
        'choice.description',
        'choice.imageUrl',
        'choice_member.memberIdx',
        'choice_member.name',
        'vc.commentIdx',
        'vc.comment',
        'vc.createdAt',
        'vcm.memberIdx',
        'vcm.name',
        'vcm.profileUrl',
        'cc.commentIdx',
        'cc.comment',
        'cc.createdAt',
        'ccm.memberIdx',
        'ccm.name',
        'ccm.profileUrl',
      ])
      .addSelect(`if(v.memberMemberIdx = ${memberIdx}, true, false) as isMe`)
      .addSelect(`CONCAT((${choicesQb.getQuery()}), '/', (${memberQb.getQuery()})) as count`)
      .orderBy({ 'vc.createdAt': 'ASC', 'cc.createdAt': 'ASC' })
      .getRawAndEntities();
    return result;
  }

  async insertVoteVote(memberIdx: number, choices: number[]): Promise<any> {
    const data = [];
    choices.forEach((choiceIdx) => {
      data.push({ memberMemberIdx: memberIdx, voteChoiceChoiceIdx: choiceIdx });
    });
    const result = await this.createQueryBuilder().insert().into('vote_choice_member').values(data).execute();
    return result;
  }

  async deleteVoteVote(memberIdx: number, choices: number[]): Promise<any> {
    const result = await this.createQueryBuilder()
      .delete()
      .from('vote_choice_member')
      .where({ memberMemberIdx: memberIdx, voteChoiceChoiceIdx: In(choices) })
      .execute();
    return result;
  }

  async insertVoteChoice(voteIdx: number, createVoteChoiceData: CreateVoteChoiceDto): Promise<any> {
    const result = await this.createQueryBuilder()
      .insert()
      .into('vote_choice')
      .values({ vote: { voteIdx }, ...createVoteChoiceData })
      .execute();
    return result;
  }
}

@EntityRepository(VoteComment)
export class VoteCommentRepository extends Repository<VoteComment> {
  async insertComment(member: Member, vote: Vote, data: object, parentComment: any): Promise<VoteComment> {
    const comment: VoteComment = this.create(data);
    comment.member = member;
    comment.vote = vote;
    comment.parentComment = parentComment;
    const result: VoteComment = await this.save(comment);
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
