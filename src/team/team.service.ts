import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserTeamRepository } from 'src/repository/user_team.repository';
import { TeamRepository } from 'src/repository/team.repository';
import { UserService } from 'src/user/user.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { Team } from 'src/entity/team.entity';
import { UpdateTeamDto } from './dto/update-team.dto';
import { DeleteResult, UpdateResult } from 'typeorm';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(TeamRepository) private teamRepository: TeamRepository,
    @InjectRepository(UserTeamRepository) private userTeamRepository: UserTeamRepository,
    private userService: UserService,
  ) {}

  async createTeam(userIdx: number, createTeamDto: CreateTeamDto, membersIdx: number[]): Promise<Team> {
    createTeamDto.id = Math.random().toString(36).substring(2, 11) + new Date().getTime().toString(36);

    const team = await this.teamRepository.insertTeam(createTeamDto);
    const leader = await this.userService.findOneByIdx(userIdx);
    const members = await this.userService.findAllByIdx(membersIdx);

    await this.userTeamRepository.insertMembers(team, members, leader);
    // TODO: 초대메일 로직 추가(메일 수락시 UserTeam.status 'W' => 'Y')
    return team;
  }

  async readAllTeams(): Promise<Team[]> {
    const teams = await this.teamRepository.find({ withDeleted: true });
    return teams;
  }

  async readTeamsByUserIdx(userIdx: number): Promise<any[]> {
    const teams = await this.teamRepository.findMyTeams(userIdx);
    teams.forEach((team) => {
      team.memberCount = parseInt(team.memberCount);
    });
    return teams;
  }
  async readTeamLeader(teamIdx: number): Promise<any> {
    const leader = await this.userTeamRepository
      .createQueryBuilder()
      .where({ team: { teamIdx }, role: '팀장' })
      .select('*')
      .getRawOne();
    return leader;
  }

  async updateTeam(teamIdx: number, updateTeamData: UpdateTeamDto): Promise<UpdateResult> {
    const updateResult = await this.teamRepository.update(teamIdx, updateTeamData);
    return updateResult;
  }

  async deleteTeam(teamIdx: number): Promise<DeleteResult> {
    const deleteResult = await this.teamRepository.softDelete({ teamIdx });
    return deleteResult;
  }
}
