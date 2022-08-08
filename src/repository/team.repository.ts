import { Member } from 'src/entity/member.entity';
import { Note } from 'src/entity/note.entity';
import { Team } from 'src/entity/team.entity';
import { CreateTeamDto } from 'src/team/dto/create-team.dto';
import { EntityRepository, getRepository, Repository } from 'typeorm';

@EntityRepository(Team)
export class TeamRepository extends Repository<Team> {
  async insertTeam(createTeamDto: CreateTeamDto): Promise<Team> {
    const team: Team = this.create(createTeamDto);
    const result: Team = await this.save(team);
    return result;
  }

  async insertNote(member: Member, team: any, data: object, files: any[], tasks: any[]): Promise<Note> {
    const noteRepository = getRepository(Note);
    const note: Note = noteRepository.create(data);
    note.member = member;
    note.team = team;
    note.files = files;
    note.tasks = tasks;
    const result: Note = await noteRepository.save(note);
    return result;
  }

  async findMyTeams(userIdx: number): Promise<any> {
    const teams = this.createQueryBuilder('t')
      .innerJoin('t.members', 'ut')
      .where('ut.user = :userIdx', { userIdx })
      .leftJoin('t.members', 'm')
      .andWhere(`m.status = 'Y'`)
      .groupBy('t.teamIdx')
      .leftJoin('t.favorites', 'f')
      .select([
        't.teamIdx as teamIdx',
        't.name as name',
        't.description as description',
        't.type as type',
        't.deadline as deadline',
        't.createdAt as createdAt',
        'if(f.userIdx is null, false, true) as favorite',
      ])
      .addSelect('COUNT(m.user)', 'memberCount')
      .getRawMany();
    return teams;
  }

  async findMembers(teamIdx: number): Promise<any[]> {
    const members = this.createQueryBuilder('t')
      .where({ teamIdx })
      .leftJoin('t.members', 'm')
      .leftJoin('m.user', 'u')
      .select(['u.userIdx as userIdx', 'm.status as status'])
      .getRawMany();
    return members;
  }

  async findTeamWithMembers(teamIdx: number): Promise<any> {
    const teams = this.createQueryBuilder('t')
      .where({ teamIdx })
      .leftJoinAndMapMany('t.members', 't.members', 'm')
      .select([
        't.teamIdx',
        't.name',
        't.createdAt',
        't.deadline',
        't.description',
        't.id',
        'm.memberIdx',
        'm.name',
        'm.role',
        'm.status',
      ])
      .getOne();
    return teams;
  }
  async upsertFavorite(userIdx: number, teamIdx: number): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into('favorite_team')
      .values({ userUserIdx: userIdx, teamTeamIdx: teamIdx })
      .orIgnore()
      .execute();
  }

  async deleteFavorite(userIdx: number, teamIdx: number): Promise<void> {
    await this.createQueryBuilder().relation('favorites').of({ teamIdx }).remove({ userIdx });
  }
}
