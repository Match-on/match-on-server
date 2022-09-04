import { CACHE_MANAGER, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { baseResponse } from 'src/config/baseResponseStatus';
import { errResponse } from 'src/config/response';
import { Note } from 'src/entity/note.entity';
import { Notice } from 'src/entity/notice.entity';
import { Univ } from 'src/entity/univ.entity';
import { User } from 'src/entity/user.entity';
import { Vote } from 'src/entity/vote.entity';
import { UserRepository } from 'src/repository/user.repository';
import { TeamService } from 'src/team/team.service';
import { UnivService } from 'src/univ/univ.service';
import { DeleteResult, getManager, getRepository, UpdateResult } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository) private userRepository: UserRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private univService: UnivService,
    @Inject(forwardRef(() => TeamService)) private teamService: TeamService,
  ) {}

  async createUser(createUserData: CreateUserDto): Promise<User> {
    await Promise.all([
      this.checkId(createUserData.id),
      this.checkEmail(createUserData.email),
      this.checkNickname(createUserData.nickname),
    ]);

    let univ: Univ = null;
    if (!!createUserData.univIdx) {
      univ = await this.univService.findOneByIdx(createUserData.univIdx);
    }

    const result = await this.userRepository.insertUser(createUserData, univ);
    return result;
  }

  async updateUser(userIdx: number, updateUserData: UpdateUserDto): Promise<UpdateResult> {
    if (!!updateUserData.nickname) await this.checkNickname(updateUserData.nickname);
    const updateResult = await this.userRepository.update(userIdx, updateUserData);
    return updateResult;
  }

  async deleteUser(userIdx: number): Promise<DeleteResult> {
    const deleteResult = await this.userRepository.softDelete({ userIdx });
    return deleteResult;
  }

  async checkId(id: string): Promise<any> {
    const checkResult = await this.userRepository.selectUserById(id);

    if (checkResult) errResponse(baseResponse.REDUNDANT_ID);
    else return true;
  }

  async checkEmail(email: string): Promise<any> {
    const checkResult = await this.userRepository.selectUserByEmail(email);

    if (checkResult) errResponse(baseResponse.REDUNDANT_EMAIL);
    else return true;
  }
  async checkNickname(nickname: string): Promise<any> {
    const checkResult = await this.userRepository.selectUserByNickname(nickname);

    if (checkResult) errResponse(baseResponse.REDUNDANT_NICKNAME);
    else return true;
  }

  async findOneById(id: string): Promise<User> {
    return this.userRepository.selectUserById(id);
  }

  async findOneByIdx(userIdx: number): Promise<User> {
    return this.userRepository.selectUserByIdx(userIdx);
  }
  async findAllByIdx(usersIdx: number[]): Promise<User[]> {
    return this.userRepository.selectUsersByIdx(usersIdx);
  }

  async generateCode(email: string): Promise<string> {
    const code = String(Math.floor(Math.random() * 10 ** 6)).padStart(6, '0');
    await this.cacheManager.set(email, code, { ttl: 300 });
    return code;
  }
  async verifyCode(email: string, code: string): Promise<boolean> {
    return (await this.cacheManager.get(email)) === code;
  }

  async getUserMain(userIdx: number): Promise<any> {
    const allTeam = await this.teamService.readTeamsByUserIdx(userIdx);
    const teamIdx = [];
    const favoriteTeam = [];
    allTeam.forEach((t) => {
      teamIdx.push(t.teamIdx);
      if (t.favorite == 1) favoriteTeam.push(t);
    });
    const noti = await this.findNoti(teamIdx);
    const now = new Date();
    console.log({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    });
    const schedule = await this.teamService.readSchedulesForUser(teamIdx, {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    });
    const dm = [];
    return { noti, favoriteTeam, schedule, dm };
  }

  async findNoti(teams: number[]): Promise<any> {
    const note = getRepository(Note)
      .createQueryBuilder('n')
      .where(`n.teamTeamIdx in (${teams.join(',')})`)
      .leftJoin('n.team', 't')
      .leftJoin('n.member', 'm')
      .select([
        'n.noteIdx as `index`',
        "'note' as type",
        't.teamIdx as teamIdx',
        'm.name as writer',
        'n.createdAt as createdAt',
      ]);
    const vote = getRepository(Vote)
      .createQueryBuilder('v')
      .where(`v.teamTeamIdx in (${teams.join(',')})`)
      .leftJoin('v.team', 't')
      .leftJoin('v.member', 'm')
      .select([
        'v.voteIdx as `index`',
        "'vote' as type",
        't.teamIdx as teamIdx',
        'm.name as writer',
        'v.createdAt as createdAt',
      ]);
    const notice = getRepository(Notice)
      .createQueryBuilder('n')
      .where(`n.teamTeamIdx in (${teams.join(',')})`)
      .leftJoin('n.team', 't')
      .leftJoin('n.member', 'm')
      .select([
        'n.noticeIdx as `index`',
        "'notice' as type",
        't.teamIdx as teamIdx',
        'm.name as writer',
        'n.createdAt as createdAt',
      ]);
    const result = await getManager().query(`
    SELECT A.*
    FROM((${note.getQuery()}) UNION (${vote.getQuery()}) UNION (${notice.getQuery()})) A
    ORDER BY A.createdAt DESC
    LIMIT 5
    `);
    return result;
  }
  async readSchedulesMonth(userIdx: number, query: { year: number; month: number }): Promise<any> {
    const allTeam = await this.teamService.readTeamsByUserIdx(userIdx);
    const teamIdx = [];
    allTeam.forEach((t) => {
      teamIdx.push(t.teamIdx);
    });
    const result = await this.teamService.readSchedulesMonthForUser(teamIdx, { year: query.year, month: query.month });
    return result;
  }
  async readSchedulesDay(userIdx: number, query: { year: number; month: number; day: number }): Promise<any> {
    const allTeam = await this.teamService.readTeamsByUserIdx(userIdx);
    const teamIdx = [];
    allTeam.forEach((t) => {
      teamIdx.push(t.teamIdx);
    });
    const result = await this.teamService.readSchedulesDayForUser(teamIdx, query);
    return result;
  }
}
