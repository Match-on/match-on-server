import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Delete,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { baseResponse } from 'src/config/baseResponseStatus';
import { errResponse, response } from 'src/config/response';
import { User } from 'src/user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { CreateMemeberDto } from './dto/create-member.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { CreateTeamWithMembersDto } from './dto/create-team-with-members.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import { CreateVoteChoiceDto } from './dto/create-vote-choice.dto';
import { CreateVoteVoteDto } from './dto/create-vote-vote.dto';
import { CreateVoteDto } from './dto/create-vote.dto';
import { ReadVoteDto } from './dto/read-vote.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UpdateMemeberDto } from './dto/update-member.dto';
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
      return response(baseResponse.SUCCESS, teamResult);
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
      if (memberResult.raw.affectedRows >= 1) {
        return response(baseResponse.SUCCESS, { memberIdx: memberResult.identifiers[0].memberIdx });
      } else {
        return errResponse(baseResponse.DB_ERROR);
      }
    }
  }
  @UseGuards(AuthGuard('jwt'))
  @Patch('/members/:memberIdx')
  async patchMember(
    @User() user: any,
    @Param('memberIdx', ParseIntPipe) memberIdx: number,
    @Body() updateMemberData: UpdateMemeberDto,
  ): Promise<object> {
    const member = await this.teamService.readMemberByIdx(memberIdx);
    if (member.userIdx != user.userIdx || member.status != 'Y' || !!member.deletedAt) {
      return errResponse(baseResponse.ACCESS_DENIED);
    } else {
      const updateResult = await this.teamService.updateMember(memberIdx, updateMemberData);
      if (updateResult.affected == 1) {
        return response(baseResponse.SUCCESS, { memberIdx });
      } else {
        return errResponse(baseResponse.DB_ERROR);
      }
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/members/:memberIdx')
  async deleteMember(@User() user: any, @Param('memberIdx', ParseIntPipe) memberIdx: number): Promise<object> {
    const member = await this.teamService.readMemberByIdx(memberIdx);
    if (!member) return errResponse(baseResponse.NOT_EXIST_MEMBER);

    const leader = await this.teamService.readTeamLeader(member.teamIdx);
    if (member.userIdx != user.userIdx && (!leader || leader.userUserIdx != user.userIdx)) {
      return errResponse(baseResponse.ACCESS_DENIED);
    } else {
      const deleteResult = await this.teamService.deleteMember(memberIdx);
      if (deleteResult.affected == 1) {
        return response(baseResponse.SUCCESS, { memberIdx });
      } else {
        return errResponse(baseResponse.DB_ERROR);
      }
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/favorites')
  async postFavorite(@User() user: any, @Body() createFavoriteData: CreateFavoriteDto): Promise<object> {
    const teamIdx = createFavoriteData.teamIdx;

    await this.teamService.createFavorite(user.userIdx, teamIdx);
    return response(baseResponse.SUCCESS);
  }
  @UseGuards(AuthGuard('jwt'))
  @Delete('/favorites/:teamIdx')
  async deleteFavorite(@User() user: any, @Param('teamIdx', ParseIntPipe) teamIdx: number): Promise<object> {
    await this.teamService.deleteFavorite(user.userIdx, teamIdx);
    return response(baseResponse.SUCCESS);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/:teamIdx/notes')
  async postNote(
    @User() user: any,
    @Param('teamIdx', ParseIntPipe) teamIdx: number,
    @Body() createNoteData: CreateNoteDto,
  ): Promise<object> {
    const { files, tasks, ...data } = createNoteData;
    const fileData = [];
    const taskData = [];
    files?.forEach((url) => {
      fileData.push({ url });
    });
    tasks?.forEach((task) => {
      taskData.push({ member: { memberIdx: task.memberIdx }, description: task.description });
    });
    await this.teamService.createNote(user.userIdx, teamIdx, data, fileData, taskData);
    return response(baseResponse.SUCCESS);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:teamIdx/notes')
  async getNotes(@User() user: any, @Param('teamIdx', ParseIntPipe) teamIdx: number): Promise<object> {
    const result = await this.teamService.readNotes(user.userIdx, teamIdx);
    return response(baseResponse.SUCCESS, result);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/notes/:noteIdx')
  async getNote(@User() user: any, @Param('noteIdx', ParseIntPipe) noteIdx: number): Promise<object> {
    const result = await this.teamService.readNote(noteIdx);
    return response(baseResponse.SUCCESS, result);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/:teamIdx/votes')
  async postVote(
    @User() user: any,
    @Param('teamIdx', ParseIntPipe) teamIdx: number,
    @Body() createVoteData: CreateVoteDto,
  ): Promise<object> {
    await this.teamService.createVote(user.userIdx, teamIdx, createVoteData);
    return response(baseResponse.SUCCESS);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:teamIdx/votes')
  async getVotes(
    @User() user: any,
    @Param('teamIdx', ParseIntPipe) teamIdx: number,
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    query: ReadVoteDto,
  ): Promise<object> {
    const { keyword, sort } = query;
    const votes = await this.teamService.readVotes(user.userIdx, teamIdx, sort, keyword);
    return response(baseResponse.SUCCESS, votes);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/votes/:voteIdx')
  async getVote(@User() user: any, @Param('voteIdx', ParseIntPipe) voteIdx: number): Promise<object> {
    const votes = await this.teamService.readVote(user.userIdx, voteIdx);
    return response(baseResponse.SUCCESS, votes);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/votes/:voteIdx/vote')
  async postVoteVote(
    @User() user: any,
    @Param('voteIdx', ParseIntPipe) voteIdx: number,
    @Body() createVoteVoteData: CreateVoteVoteDto,
  ): Promise<object> {
    await this.teamService.createVoteVote(user.userIdx, voteIdx, createVoteVoteData);
    return response(baseResponse.SUCCESS);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/votes/:voteIdx/choices')
  async postVoteChoice(
    @User() user: any,
    @Param('voteIdx', ParseIntPipe) voteIdx: number,
    @Body() createVoteChoiceData: CreateVoteChoiceDto,
  ): Promise<object> {
    await this.teamService.createVoteChoice(voteIdx, createVoteChoiceData);
    return response(baseResponse.SUCCESS);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/votes/:voteIdx/comments')
  async postComment(
    @User() user: any,
    @Param('voteIdx', ParseIntPipe) voteIdx: number,
    @Body() createCommentData: CreateCommentDto,
  ): Promise<object> {
    const { comment, parentIdx } = createCommentData;
    await this.teamService.createComment(user.userIdx, voteIdx, comment, parentIdx);
    return response(baseResponse.SUCCESS);
  }
  @UseGuards(AuthGuard('jwt'))
  @Patch('/votes/comments/:commentIdx')
  async patchComment(
    @User() user: any,
    @Param('commentIdx', ParseIntPipe) commentIdx: number,
    @Body() updateCommentData: UpdateCommentDto,
  ): Promise<object> {
    await this.teamService.updateComment(user.userIdx, commentIdx, updateCommentData.comment);
    return response(baseResponse.SUCCESS);
  }
  @UseGuards(AuthGuard('jwt'))
  @Delete('/votes/comments/:commentIdx')
  async deleteComment(@User() user: any, @Param('commentIdx', ParseIntPipe) commentIdx: number): Promise<object> {
    await this.teamService.deleteComment(user.userIdx, commentIdx);
    return response(baseResponse.SUCCESS);
  }
}
