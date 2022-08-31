import { Member } from 'src/entity/member.entity';
import { Schedule } from 'src/entity/schedule.entity';
import { EntityRepository, InsertResult, Like, Repository } from 'typeorm';

@EntityRepository(Schedule)
export class ScheduleRepository extends Repository<Schedule> {
  async insertSchedule(member: Member, team: any, data: object): Promise<InsertResult> {
    const result = await this.createQueryBuilder('s')
      .insert()
      .values({ member, team, ...data })
      .execute();
    return result;
  }
  async findSchedulesDay(teamIdx: number, year: number, month: number, day: number): Promise<any> {
    const targetDate = new Date(year, month - 1, day, 10, 0, 0, 0);
    const result = await this.createQueryBuilder('s')
      .leftJoin('s.member', 'm')
      .where({ team: { teamIdx } })
      .andWhere(`DATE(s.endTime) >= DATE(:target) AND DATE(s.startTime) <= DATE(:target)`, { target: targetDate })
      .select(['s.scheduleIdx', 's.title', 's.startTime', 's.endTime', 's.color', 'm.name'])
      .orderBy({ startTime: 'ASC', endTime: 'ASC' })
      .getMany();
    return result;
  }
  async findSchedulesMonth(teamIdx: number, year: number, month: number): Promise<any> {
    const result = await this.createQueryBuilder('s')
      .leftJoin('s.member', 'm')
      .where({ team: { teamIdx } })
      .andWhere(
        `(YEAR(s.endTime) = ${year} AND MONTH(s.endTime) = ${month}) OR (YEAR(s.startTime) = ${year} AND MONTH(s.startTime) = ${month})`,
      )
      .select(['s.scheduleIdx', 's.title', 's.startTime', 's.endTime', 's.color', 'm.name'])
      .orderBy({ startTime: 'ASC', endTime: 'ASC' })
      .getMany();
    return result;
  }
  async findSchedulesWithKeyword(teamIdx: number, keyword: string): Promise<any> {
    const result = await this.createQueryBuilder('s')
      .leftJoin('s.member', 'm')
      .where({ team: { teamIdx } })
      .andWhere({ title: Like(`%${keyword}%`) })
      .select(['s.scheduleIdx', 's.title', 's.startTime', 's.endTime', 's.color', 'm.name'])
      .orderBy({ startTime: 'ASC', endTime: 'ASC' })
      .getMany();
    return result;
  }
}
