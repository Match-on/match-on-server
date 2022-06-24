import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserTeamRepository } from 'src/repository/user_team.repository';
import { TeamRepository } from 'src/repository/team.repository';
import { UserService } from 'src/user/user.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { Team } from 'src/entity/team.entity';
import { UpdateTeamDto } from './dto/update-team.dto';
import { DeleteResult, InsertResult, UpdateResult } from 'typeorm';
import { errResponse } from 'src/config/response';
import { baseResponse } from 'src/config/baseResponseStatus';

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
  async checkTeamMember(teamIdx: number, userIdx: number): Promise<any> {
    const members = await this.teamRepository.findMembers(teamIdx);

    for (let i = 0; i < members.length; i++) {
      if (members[i].userIdx == userIdx && members[i].status == 'Y') {
        return true;
      }
    }
    return errResponse(baseResponse.ACCESS_DENIED);
  }
  async readTeamProfile(teamIdx: number): Promise<any> {
    const teamProfile = await this.teamRepository.findTeamWithMembers(teamIdx);
    return teamProfile;
  }

  async updateTeam(teamIdx: number, updateTeamData: UpdateTeamDto): Promise<UpdateResult> {
    const updateResult = await this.teamRepository.update(teamIdx, updateTeamData);
    return updateResult;
  }

  async deleteTeam(teamIdx: number): Promise<DeleteResult> {
    const deleteResult = await this.teamRepository.softDelete({ teamIdx });
    return deleteResult;
  }

  async createMember(teamIdx: number, userIdx: number): Promise<InsertResult> {
    const user = await this.userService.findOneByIdx(userIdx);
    const result = await this.userTeamRepository.insertMember({ teamIdx }, user);
    //TODO: 초대 메일 로직
    return result;
  }
}
