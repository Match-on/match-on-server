import { Team } from 'src/entity/team.entity';
import { User } from 'src/entity/user.entity';
import { UserTeam } from 'src/entity/user_team.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(UserTeam)
export class UserTeamRepository extends Repository<UserTeam> {
  async insertMember(team: Team, user: User): Promise<UserTeam> {
    const member = new UserTeam();
    member.name = user.name;
    member.user = user;
    member.team = team;
    const result = await this.save(member);
    return result;
  }
  async insertMembers(team: Team, users: User[]): Promise<UserTeam[]> {
    const promises = [];
    users.forEach((user) => {
      const member = new UserTeam();
      member.name = user.name;
      member.user = user;
      member.team = team;
      promises.push(this.save(member));
    });
    const result = await Promise.all(promises);
    return result;
  }
}
