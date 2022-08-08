import { Member } from 'src/entity/member.entity';
import { Vote } from 'src/entity/vote.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Vote)
export class VoteRepository extends Repository<Vote> {
  async insertVote(member: Member, team: any, data: object): Promise<Vote> {
    const vote: Vote = this.create(data);
    vote.member = member;
    vote.team = team;
    const result: Vote = await this.save(vote);
    return result;
  }
}
