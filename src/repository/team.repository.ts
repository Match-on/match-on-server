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

  async findMyTeams(userIdx: number): Promise<any> {
    const teams = this.createQueryBuilder('t')
      .innerJoin('t.members', 'ut')
      .where('ut.user = :userIdx', { userIdx })
      .leftJoin('t.members', 'm')
      .andWhere(`m.status = 'Y'`)
      .groupBy('t.teamIdx')
      .select([
        't.teamIdx as teamIdx',
        't.name as name',
        't.description as description',
        't.type as type',
        't.deadline as deadline',
        't.createdAt as createdAt',
      ])
      .addSelect('COUNT(m.user)', 'memberCount')
      .getRawMany();
    //TODO: 즐겨찾기 표시 필요
    return teams;
  }
}
