import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { baseResponse } from 'src/config/baseResponseStatus';
import { errResponse, response } from 'src/config/response';
import { User } from 'src/user.decorator';
import { CreateTeamWithMembersDto } from './dto/create-team-with-members.dto';
import { CreateTeamDto } from './dto/create-team.dto';
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
  async getTeam(@User() user: any, @Query() query: any): Promise<object> {
    const { userIdx } = query;
    if (!userIdx && user.role == 'admin') {
      // TODO: getAllTeam
      const teamResult = await this.teamService.readAllTeams();
      return response(baseResponse.SUCCESS, { teams: teamResult });
    } else if (userIdx == user.userIdx) {
      // TODO: get My Team
      const teamResult = await this.teamService.readTeamsByUserIdx(userIdx);
      return response(baseResponse.SUCCESS, { teams: teamResult });
    } else {
      return errResponse(baseResponse.ACCESS_DENIED);
    }
  }
}
