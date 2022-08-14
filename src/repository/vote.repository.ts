import { Member } from 'src/entity/member.entity';
import { VoteComment } from 'src/entity/vote-comment.entity';
import { Vote } from 'src/entity/vote.entity';
import { EntityRepository, In, Repository } from 'typeorm';

@EntityRepository(Vote)
export class VoteRepository extends Repository<Vote> {
  async insertVote(member: Member, team: any, data: object): Promise<Vote> {
    const vote: Vote = this.create(data);
    vote.member = member;
    vote.team = team;
    const result: Vote = await this.save(vote);
    return result;
  }

  async insertVoteChoice(memberIdx: number, choices: number[]): Promise<any> {
    const data = [];
    choices.forEach((choiceIdx) => {
      data.push({ memberMemberIdx: memberIdx, voteChoiceChoiceIdx: choiceIdx });
    });
    const result = await this.createQueryBuilder().insert().into('vote_choice_member').values(data).execute();
    return result;
  }

  async deleteVoteChoice(memberIdx: number, choices: number[]): Promise<any> {
    const result = await this.createQueryBuilder()
      .delete()
      .from('vote_choice_member')
      .where({ memberMemberIdx: memberIdx, voteChoiceChoiceIdx: In(choices) })
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
