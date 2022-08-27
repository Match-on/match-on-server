import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemberRepository } from 'src/repository/member.repository';
import { TeamRepository } from 'src/repository/team.repository';
import { UserService } from 'src/user/user.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { Team } from 'src/entity/team.entity';
import { UpdateTeamDto } from './dto/update-team.dto';
import { DeleteResult, getRepository, InsertResult, UpdateResult } from 'typeorm';
import { errResponse } from 'src/config/response';
import { baseResponse } from 'src/config/baseResponseStatus';
import { UpdateMemeberDto } from './dto/update-member.dto';
import { Note } from 'src/entity/note.entity';
import { Member } from 'src/entity/member.entity';
import { CreateVoteDto } from './dto/create-vote.dto';
import { VoteCommentRepository, VoteRepository } from 'src/repository/vote.repository';
import { Vote } from 'src/entity/vote.entity';
import { CreateVoteChoiceDto } from './dto/create-vote-choice.dto';
import { LectureService } from 'src/lecture/lecture.service';
import { StudyService } from 'src/study/study.service';
import { CreateVoteVoteDto } from './dto/create-vote-vote.dto';
import { ScheduleRepository } from 'src/repository/schedule.repository';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CreateMemoDto } from './dto/create-memo.dto';
import { MemberMemo } from 'src/entity/member-memo.entity';
import { NoteCommentRepository, NoteRepository } from 'src/repository/note.repository';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(TeamRepository) private teamRepository: TeamRepository,
    @InjectRepository(MemberRepository) private memberRepository: MemberRepository,
    @InjectRepository(VoteRepository) private voteRepository: VoteRepository,
    @InjectRepository(VoteCommentRepository) private voteCommentRepository: VoteCommentRepository,
    @InjectRepository(NoteRepository) private noteRepository: NoteRepository,
    @InjectRepository(NoteCommentRepository) private noteCommentRepository: NoteCommentRepository,
    @InjectRepository(ScheduleRepository) private scheduleRepository: ScheduleRepository,
    private userService: UserService,
    private studyService: StudyService,
    private lectureService: LectureService,
  ) {}

  async createTeam(userIdx: number, createTeamDto: CreateTeamDto, membersIdx: number[]): Promise<Team> {
    createTeamDto.id = Math.random().toString(36).substring(2, 11) + new Date().getTime().toString(36);

    if (createTeamDto.type == '스터디') {
      await this.studyService.updateStudy(userIdx, createTeamDto.index, null, null, { status: 'D' });
    } else {
      await this.lectureService.updatePost(userIdx, createTeamDto.index, { status: 'D' });
    }

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
  async readMemberDetail(memberIdx: number): Promise<any> {
    const member = await this.memberRepository.findMember(memberIdx);
    if (!member) {
      return errResponse(baseResponse.NOT_EXIST_MEMBER);
    }
    return member;
  }
  async readMemberAll(userIdx: number, teamIdx: number): Promise<any> {
    const member = await this.readMemberWithoutIdx(userIdx, teamIdx);

    const members = await this.memberRepository.findMemberAll(teamIdx);
    members.forEach((m) => {
      if (m.memberIdx == member.memberIdx) m['isMe'] = '1';
      else m['isMe'] = '0';
    });
    return members;
  }

  async readMemberWithoutIdx(userIdx: number, teamIdx: number): Promise<Member> {
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
    const result = await this.noteRepository.insertNote(writer, { teamIdx }, data, files, tasks);
    return result;
  }
  async createNoteHit(userIdx: number, noteIdx: number): Promise<void> {
    await this.noteRepository.upsertNoteHit(userIdx, noteIdx);
  }
  async checkNote(noteIdx: number, option?: object): Promise<Note> {
    const note = await getRepository(Note).findOne(noteIdx, option);
    if (!note) {
      return errResponse(baseResponse.NOT_EXIST_NOTE);
    }
    return note;
  }
  async readNotes(userIdx: number, teamIdx: number, keyword: string): Promise<Note> {
    await this.readTeam(teamIdx);
    const viewer = await this.readMemberWithoutIdx(userIdx, teamIdx);

    const result = await this.noteRepository.findNotes(teamIdx, viewer.memberIdx, keyword);
    result?.forEach((r) => {
      r.files = r.files?.split(',') || [];
    });
    return result;
  }
  async readNote(userIdx: number, noteIdx: number): Promise<Note> {
    const note = await this.checkNote(noteIdx, { relations: ['team'] });
    const viewer = await this.readMemberWithoutIdx(userIdx, note.team.teamIdx);

    await this.createVoteHit(userIdx, noteIdx);

    const result = await this.noteRepository.findNote(viewer.memberIdx, noteIdx);
    const raw = result.raw;
    const entity = result.entities[0];

    entity['writer'] = entity.member.name;
    delete entity.member;
    entity['isMe'] = raw[0].isMe;
    if (!!entity.comments) {
      entity.comments.forEach((comment) => {
        comment['name'] = comment.member.name;
        comment['profileUrl'] = comment.member.profileUrl;
        comment['isMe'] = comment.member.memberIdx == viewer.memberIdx ? '1' : '0';

        delete comment['member'];
        comment.childComments.forEach((child) => {
          child['name'] = child.member.name;
          child['profileUrl'] = child.member.profileUrl;
          child['isMe'] = child.member.memberIdx == viewer.memberIdx ? '1' : '0';
          delete child['member'];
        });
      });
    }
    entity.tasks = entity.team.members;
    delete entity.team;
    entity.tasks.forEach((task) => {
      task.description = [];
      task.noteTasks.forEach((t) => {
        task.description.push(t.description);
      });
      delete task.noteTasks;
    });

    return entity;
  }

  async checkNoteComment(commentIdx: number): Promise<{ userIdx: number; memberIdx: number }> {
    const comment = await this.noteCommentRepository.findComment(commentIdx);
    if (!comment) {
      return errResponse(baseResponse.NOT_EXIST_NOTE_COMMENT);
    }
    return comment;
  }

  async createNoteComment(userIdx: number, noteIdx: number, comment: string, parentIdx: number): Promise<void> {
    const note = await this.checkNote(noteIdx, { relations: ['team'] });
    const writer = await this.readMemberWithoutIdx(userIdx, note.team.teamIdx);

    if (parentIdx) {
      await this.checkNoteComment(parentIdx);
    }

    await this.noteCommentRepository.insertComment(writer, note, { comment }, { commentIdx: parentIdx });
  }

  async updateNoteComment(userIdx: number, commentIdx: number, comment: string): Promise<UpdateResult> {
    const result = await this.checkNoteComment(commentIdx);
    if (result.userIdx != userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }
    const updateResult = await this.noteCommentRepository.update(commentIdx, { comment });
    return updateResult;
  }
  async deleteNoteComment(userIdx: number, commentIdx: number): Promise<DeleteResult> {
    const result = await this.checkNoteComment(commentIdx);
    if (result.userIdx != userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }
    const deleteResult = await this.noteCommentRepository.softDelete({ commentIdx });
    return deleteResult;
  }

  async createVote(userIdx: number, teamIdx: number, createVoteData: CreateVoteDto): Promise<Vote> {
    await this.readTeam(teamIdx);
    const writer = await this.readMemberWithoutIdx(userIdx, teamIdx);

    const result = await this.voteRepository.insertVote(writer, { teamIdx }, createVoteData);
    return result;
  }

  async createVoteHit(userIdx: number, voteIdx: number): Promise<void> {
    await this.voteRepository.upsertVoteHit(userIdx, voteIdx);
  }
  async readVotes(userIdx: number, teamIdx: number, sort: string, keyword?: string): Promise<any[]> {
    await this.readTeam(teamIdx);
    const viewer = await this.readMemberWithoutIdx(userIdx, teamIdx);

    const result = await this.voteRepository.findVotes({ teamIdx }, viewer, sort, keyword);
    return result;
  }
  async readVote(userIdx: number, voteIdx: number): Promise<any> {
    const vote = await this.checkVote(voteIdx, { relations: ['team'] });
    const viewer = await this.readMemberWithoutIdx(userIdx, vote.team.teamIdx);

    await this.createVoteHit(userIdx, voteIdx);

    const result = await this.voteRepository.findVote(voteIdx, viewer.memberIdx);
    const raw = result.raw;
    const entity = result.entities[0];
    entity['isMe'] = raw[0].isMe;
    entity['count'] = raw[0].count;
    entity.choices.forEach((c) => {
      c['isMe'] = false;
      c['voter'] = [];
      c.member.forEach((m) => {
        if (m.memberIdx == viewer.memberIdx) {
          c['isMe'] = true;
        }
        c.voter.push(m.name);
      });
      c['count'] = c.member.length;

      if (entity.isAnonymous) {
        delete c.voter;
      }
      delete c.member;
    });
    if (!!entity.comments) {
      entity.comments.forEach((comment) => {
        comment['name'] = comment.member.name;
        comment['profileUrl'] = comment.member.profileUrl;
        comment['isMe'] = comment.member.memberIdx == viewer.memberIdx ? '1' : '0';

        delete comment['member'];
        comment.childComments.forEach((child) => {
          child['name'] = child.member.name;
          child['profileUrl'] = child.member.profileUrl;
          child['isMe'] = child.member.memberIdx == viewer.memberIdx ? '1' : '0';
          delete child['member'];
        });
      });
    }

    return entity;
  }

  async checkVote(voteIdx: number, option?: object): Promise<Vote> {
    const vote = await this.voteRepository.findOne(voteIdx, option);
    if (!vote) {
      return errResponse(baseResponse.NOT_EXIST_VOTE);
    }
    return vote;
  }

  async createVoteVote(userIdx: number, voteIdx: number, createVoteVoteData: CreateVoteVoteDto): Promise<void> {
    const vote = await this.checkVote(voteIdx, { relations: ['team', 'choices'] });
    const voter = await this.readMemberWithoutIdx(userIdx, vote.team.teamIdx);

    if (!vote.isMultiple && createVoteVoteData.choices.length > 1) {
      return errResponse(baseResponse.NOT_MULTIPLE_VOTE);
    }
    const choiceSet = new Set<number>();
    vote.choices.forEach((choice) => {
      choiceSet.add(choice.choiceIdx);
    });
    createVoteVoteData.choices.forEach((choice: number) => {
      if (!choiceSet.has(choice)) {
        return errResponse(baseResponse.NOT_EXIST_VOTE_CHOICE);
      }
    });
    await this.voteRepository.deleteVoteVote(voter.memberIdx, Array.from<number>(choiceSet));
    const result = await this.voteRepository.insertVoteVote(voter.memberIdx, createVoteVoteData.choices);
    return result;
  }

  async createVoteChoice(voteIdx: number, createVoteChoiceData: CreateVoteChoiceDto): Promise<void> {
    const vote = await this.checkVote(voteIdx, { relations: ['team', 'choices'] });

    if (!vote.isAddable) {
      return errResponse(baseResponse.NOT_ADDABLE_VOTE);
    }

    const result = await this.voteRepository.insertVoteChoice(voteIdx, createVoteChoiceData);
    return result;
  }

  async checkVoteComment(commentIdx: number): Promise<{ userIdx: number; memberIdx: number }> {
    const comment = await this.voteCommentRepository.findComment(commentIdx);
    if (!comment) {
      return errResponse(baseResponse.NOT_EXIST_VOTE_COMMENT);
    }
    return comment;
  }

  async createVoteComment(userIdx: number, voteIdx: number, comment: string, parentIdx: number): Promise<void> {
    const vote = await this.checkVote(voteIdx, { relations: ['team', 'choices'] });
    const writer = await this.readMemberWithoutIdx(userIdx, vote.team.teamIdx);

    if (parentIdx) {
      await this.checkVoteComment(parentIdx);
    }

    await this.voteCommentRepository.insertComment(writer, vote, { comment }, { commentIdx: parentIdx });
  }

  async updateVoteComment(userIdx: number, commentIdx: number, comment: string): Promise<UpdateResult> {
    const result = await this.checkVoteComment(commentIdx);
    if (result.userIdx != userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }
    const updateResult = await this.voteCommentRepository.update(commentIdx, { comment });
    return updateResult;
  }
  async deleteVoteComment(userIdx: number, commentIdx: number): Promise<DeleteResult> {
    const result = await this.checkVoteComment(commentIdx);
    if (result.userIdx != userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }
    const deleteResult = await this.voteCommentRepository.softDelete({ commentIdx });
    return deleteResult;
  }

  async createSchedule(userIdx: number, teamIdx: number, createScheduleData: CreateScheduleDto): Promise<any> {
    await this.readTeam(teamIdx);
    const writer = await this.readMemberWithoutIdx(userIdx, teamIdx);

    const result = await this.scheduleRepository.insertSchedule(writer, { teamIdx }, createScheduleData);
    return result;
  }

  async readSchedules(userIdx: number, teamIdx: number, query: { year: number; month: number }): Promise<any> {
    await this.readTeam(teamIdx);
    await this.readMemberWithoutIdx(userIdx, teamIdx);

    const result = await this.scheduleRepository.findSchedules(teamIdx, query.year, query.month);
    return result;
  }

  async readSchedulesWithKeyword(userIdx: number, teamIdx: number, keyword: string): Promise<any> {
    await this.readTeam(teamIdx);
    await this.readMemberWithoutIdx(userIdx, teamIdx);

    const result = await this.scheduleRepository.findSchedulesWithKeyword(teamIdx, keyword);
    return result;
  }

  async updateSchedule(scheduleIdx: number, updateScheduleData: UpdateScheduleDto): Promise<UpdateResult> {
    const updateResult = await this.scheduleRepository.update(scheduleIdx, updateScheduleData);
    return updateResult;
  }

  async createMemo(memberIdx: number, createMemoData: CreateMemoDto): Promise<any> {
    await this.readMemberDetail(memberIdx);

    const result = await this.memberRepository.insertMemo({ memberIdx }, createMemoData);
    return result;
  }
  async updateMemo(memoIdx: number, memo: string): Promise<UpdateResult> {
    const updateResult = await getRepository(MemberMemo).update(memoIdx, { memo });
    return updateResult;
  }
  async deleteMemo(memoIdx: number): Promise<DeleteResult> {
    const deleteResult = await getRepository(MemberMemo).softDelete({ memoIdx });
    return deleteResult;
  }
}
