import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberRepository } from 'src/repository/member.repository';
import { TeamRepository } from 'src/repository/team.repository';
import { UserService } from 'src/user/user.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { Team } from 'src/entity/team.entity';
import { UpdateTeamDto } from './dto/update-team.dto';
import { DeleteResult, InsertResult, UpdateResult } from 'typeorm';
import { errResponse } from 'src/config/response';
import { baseResponse } from 'src/config/baseResponseStatus';
import { UpdateMemeberDto } from './dto/update-member.dto';
import { Note } from 'src/entity/note.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(TeamRepository) private teamRepository: TeamRepository,
    @InjectRepository(MemberRepository) private memberRepository: MemberRepository,
    private userService: UserService,
  ) {}

  async createTeam(userIdx: number, createTeamDto: CreateTeamDto, membersIdx: number[]): Promise<Team> {
    createTeamDto.id = Math.random().toString(36).substring(2, 11) + new Date().getTime().toString(36);

    const team = await this.teamRepository.insertTeam(createTeamDto);
    const leader = await this.userService.findOneByIdx(userIdx);
    const members = await this.userService.findAllByIdx(membersIdx);

    await this.memberRepository.insertMembers(team, members, leader);
    // TODO: 초대메일 로직 추가(메일 수락시 UserTeam.status 'W' => 'Y')
    return team;
  }

  async readTeam(teamIdx: number): Promise<Team> {
    const team = await this.teamRepository.findOne({ teamIdx });

    if (!team || !!team.deletedAt || team.status != 'Y') {
      return errResponse(baseResponse.NOT_EXIST_TEAM);
    }
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
    const leader = await this.memberRepository
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
    const result = await this.memberRepository.insertMember({ teamIdx }, user);
    //TODO: 초대 메일 로직
    return result;
  }

  async readMemberByIdx(memberIdx: number): Promise<any> {
    const member = await this.memberRepository
      .createQueryBuilder()
      .where({ memberIdx })
      .select(['userUserIdx as userIdx', 'teamTeamIdx as teamIdx', 'status', 'deletedAt'])
      .getRawOne();
    if (!member || member.status != 'Y') {
      return errResponse(baseResponse.NOT_EXIST_MEMBER);
    }
    return member;
  }

  async readMemberWithoutIdx(userIdx: number, teamIdx: number): Promise<any> {
    const member = await this.memberRepository
      .createQueryBuilder('m')
      .where({ user: { userIdx }, team: { teamIdx } })
      .select(['m.memberIdx', 'm.status'])
      .getOne();
    if (!member || member.status != 'Y') {
      return errResponse(baseResponse.NOT_EXIST_MEMBER);
    }
    return member;
  }

  async checkMember(memberIdx: number, teamIdx: number): Promise<any> {
    const member = await this.memberRepository
      .createQueryBuilder('m')
      .where({ memberIdx: memberIdx, team: { teamIdx } })
      .select(['m.memberIdx', 'm.status'])
      .getOne();
    if (!member || member.status != 'Y') {
      return errResponse(baseResponse.NOT_TEAM_MEMBER);
    }
    return member;
  }

  async updateMember(memberIdx: number, updateMemberData: UpdateMemeberDto): Promise<UpdateResult> {
    const updateResult = await this.memberRepository.update(memberIdx, updateMemberData);
    //TODO: 메모 추가
    return updateResult;
  }

  async deleteMember(memberIdx: number): Promise<DeleteResult> {
    const deleteResult = await this.memberRepository.softDelete({ memberIdx });
    return deleteResult;
  }

  async createFavorite(userIdx: number, teamIdx: number): Promise<void> {
    await this.readTeam(teamIdx);
    await this.teamRepository.upsertFavorite(userIdx, teamIdx);
  }

  async deleteFavorite(userIdx: number, teamIdx: number): Promise<void> {
    await this.readTeam(teamIdx);
    await this.teamRepository.deleteFavorite(userIdx, teamIdx);
  }

  async createNote(
    userIdx: number,
    teamIdx: number,
    data: { title: string; body: string },
    files?: any[],
    tasks?: any[],
  ): Promise<Note> {
    await this.readTeam(teamIdx);
    const writer = await this.readMemberWithoutIdx(userIdx, teamIdx);
    if (tasks) {
      for (let i = 0; i < tasks.length; i++) {
        await this.checkMember(tasks[i].member.memberIdx, teamIdx);
      }
    }
    const result = await this.teamRepository.insertNote(writer, { teamIdx }, data, files, tasks);
    return result;
  }
}
