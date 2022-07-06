import { Team } from 'src/entity/team.entity';
import { User } from 'src/entity/user.entity';
import { Member } from 'src/entity/member.entity';
import { EntityRepository, InsertResult, Repository } from 'typeorm';

@EntityRepository(Member)
export class MemberRepository extends Repository<Member> {
  async insertMember(team: any, user: User): Promise<InsertResult> {
    const member = new Member();
    member.memberIdx = null;
    member.name = user.name;
    member.user = user;
    member.team = team;
    member.status = 'W';
    member.deletedAt = null;

    const result = await this.upsert(member, ['user', 'team']);
    return result;
  }

  async insertMembers(team: Team, users: User[], leader: User): Promise<Member[]> {
    const members = [];
    if (!!leader) {
      const member = new Member();
      member.name = leader.name;
      member.user = leader;
      member.team = team;
      member.role = '팀장';
      members.push(member);
    }

    users.forEach((user) => {
      const member = new Member();
      member.name = user.name;
      member.user = user;
      member.team = team;
      member.status = 'W';
      members.push(member);
    });

    const result = await this.save(members);
    return result;
  }
}
