import { Team } from 'src/entity/team.entity';
import { User } from 'src/entity/user.entity';
import { Member } from 'src/entity/member.entity';
import { EntityRepository, InsertResult, Repository } from 'typeorm';
import { MemberMemo } from 'src/entity/member-memo.entity';

@EntityRepository(Member)
export class MemberRepository extends Repository<Member> {
  async insertMember(team: any, user: User): Promise<InsertResult> {
    const member = new Member();
    member.memberIdx = null;
    member.name = user.name;
    member.user = user;
    member.team = team;
    member.status = 'W';
    member.deletedAt = null;

    const result = await this.upsert(member, ['user', 'team']);
    return result;
  }

  async insertMembers(team: Team, users: User[], leader: User): Promise<Member[]> {
    const members = [];
    if (!!leader) {
      const member = new Member();
      member.name = leader.name;
      member.user = leader;
      member.team = team;
      member.role = '팀장';
      members.push(member);
    }

    users.forEach((user) => {
      const member = new Member();
      member.name = user.name;
      member.user = user;
      member.team = team;
      member.status = 'W';
      members.push(member);
    });

    const result = await this.save(members);
    return result;
  }
  async findMember(memberIdx: number): Promise<Member> {
    const member = await this.createQueryBuilder('m')
      .where({ memberIdx, status: 'Y' })
      .leftJoin('m.memos', 'mm')
      .select(['m.name', 'm.detail', 'm.profileUrl', 'mm.memoIdx', 'mm.memo'])
      .getOne();
    return member;
  }
  async findMemberAll(teamIdx: number): Promise<Member[]> {
    const member = await this.createQueryBuilder('m')
      .where({ team: { teamIdx } })
      .leftJoin('m.memos', 'mm')
      .select(['m.memberIdx', 'm.name', 'm.detail', 'm.profileUrl', 'mm.memoIdx', 'mm.memo'])
      .getMany();
    return member;
  }
  async insertMemo(member: object, createMemoData: object): Promise<InsertResult> {
    const result = await this.createQueryBuilder()
      .insert()
      .into(MemberMemo)
      .values({ member, ...createMemoData })
      .execute();
    return result;
  }
}
