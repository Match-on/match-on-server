import { Team } from 'src/entity/team.entity';
import { User } from 'src/entity/user.entity';
import { UserTeam } from 'src/entity/user_team.entity';
import { EntityRepository, InsertResult, Repository } from 'typeorm';

@EntityRepository(UserTeam)
export class UserTeamRepository extends Repository<UserTeam> {
  async insertMember(team: any, user: User): Promise<InsertResult> {
    const member = new UserTeam();
    member.memberIdx = null;
    member.name = user.name;
    member.user = user;
    member.team = team;
    member.status = 'W';
    member.deletedAt = null;

    const result = await this.upsert(member, ['user', 'team']);
    return result;
  }

  async insertMembers(team: Team, users: User[], leader: User): Promise<UserTeam[]> {
    const members = [];
    if (!!leader) {
      const member = new UserTeam();
      member.name = leader.name;
      member.user = leader;
      member.team = team;
      member.role = '팀장';
      members.push(member);
    }

    users.forEach((user) => {
      const member = new UserTeam();
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
