import { Member } from 'src/entity/member.entity';
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
