import { Team } from 'src/entity/team.entity';
import { CreateTeamDto } from 'src/team/dto/create-team.dto';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Team)
export class TeamRepository extends Repository<Team> {
  async insertTeam(createTeamDto: CreateTeamDto): Promise<Team> {
    const team: Team = this.create(createTeamDto);
    const result: Team = await this.save(team);
    return result;
  }
}
