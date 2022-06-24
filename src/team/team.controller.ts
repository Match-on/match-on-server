import { Body, Controller, Get, Patch, Post, Param, Query, ParseIntPipe, UseGuards, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { baseResponse } from 'src/config/baseResponseStatus';
import { errResponse, response } from 'src/config/response';
import { User } from 'src/user.decorator';
import { CreateMemeberDto } from './dto/create-member.dto';
import { CreateTeamWithMembersDto } from './dto/create-team-with-members.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { TeamService } from './team.service';

@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async postTeam(@User() user: any, @Body() createTeamData: CreateTeamWithMembersDto): Promise<object> {
    const teamResult = await this.teamService.createTeam(
      user.userIdx,
      <CreateTeamDto>createTeamData,
      createTeamData.members,
    );

    if (teamResult) {
      return response(baseResponse.SUCCESS, { teamIdx: teamResult.teamIdx });
    } else {
      return errResponse(baseResponse.SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getTeams(@User() user: any, @Query() query: any): Promise<object> {
    const { userIdx } = query;
    if (!userIdx && user.role == 'admin') {
      const teamResult = await this.teamService.readAllTeams();
      return response(baseResponse.SUCCESS, { teams: teamResult });
    } else if (userIdx == user.userIdx) {
      const teamResult = await this.teamService.readTeamsByUserIdx(userIdx);
      return response(baseResponse.SUCCESS, { teams: teamResult });
    } else {
      return errResponse(baseResponse.ACCESS_DENIED);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:teamIdx')
  async getTeam(
    @User() user: any,
    @Param('teamIdx', ParseIntPipe) teamIdx: number,
    @Query() query: any,
  ): Promise<object> {
    const { type } = query;
    await this.teamService.checkTeamMember(teamIdx, user.userIdx);
    if (type == 'profile') {
      const teamResult = await this.teamService.readTeamProfile(teamIdx);
      return response(baseResponse.SUCCESS, { team: teamResult });
    } else if (type == 'main') {
      // TODO: 팀 메인정보
      return response(baseResponse.SUCCESS, {});
    } else {
      return errResponse(baseResponse.ACCESS_DENIED);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/:teamIdx')
  async patchTeam(
    @User() user: any,
    @Param('teamIdx', ParseIntPipe) teamIdx: number,
    @Body() updateTeamData: UpdateTeamDto,
  ): Promise<object> {
    const leader = await this.teamService.readTeamLeader(teamIdx);
    if (!leader || leader.userUserIdx != user.userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    } else {
      const updateResult = await this.teamService.updateTeam(teamIdx, updateTeamData);
      if (updateResult.affected == 1) {
        return response(baseResponse.SUCCESS, { teamIdx });
      } else {
        return errResponse(baseResponse.DB_ERROR);
      }
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/:teamIdx')
  async deleteTeam(@User() user: any, @Param('teamIdx', ParseIntPipe) teamIdx: number): Promise<object> {
    const leader = await this.teamService.readTeamLeader(teamIdx);
    if (!leader || leader.userUserIdx != user.userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    } else {
      const deleteResult = await this.teamService.deleteTeam(teamIdx);
      if (deleteResult.affected == 1) {
        return response(baseResponse.SUCCESS, { teamIdx });
      } else {
        return errResponse(baseResponse.DB_ERROR);
      }
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/members')
  async postMember(@User() user: any, @Body() createMemberData: CreateMemeberDto): Promise<object> {
    const leader = await this.teamService.readTeamLeader(createMemberData.teamIdx);
    if (!leader || leader.userUserIdx != user.userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    } else {
      const memberResult = await this.teamService.createMember(createMemberData.teamIdx, createMemberData.userIdx);
      if (memberResult.raw.affectedRows == 1) {
        return response(baseResponse.SUCCESS, { memberIdx: memberResult.identifiers[0].memberIdx });
      } else {
        return errResponse(baseResponse.DB_ERROR);
      }
    }
  }
}
