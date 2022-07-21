import { Univ } from 'src/entity/univ.entity';
import { User } from 'src/entity/user.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async insertUser(createUserData: CreateUserDto, univ?: Univ): Promise<User> {
    const user: User = this.create(createUserData);
    user.univ = univ;
    const result: User = await this.save(user);
    return result;
  }

  async selectUserById(id: string): Promise<User> {
    const user = await this.createQueryBuilder().where('id = :id', { id: id }).withDeleted().select('*').getRawOne();
    return user;
  }

  async selectUserByIdx(userIdx: number): Promise<User> {
    const user = await this.createQueryBuilder()
      .withDeleted()
      .where('userIdx = :userIdx', { userIdx: userIdx })
      .getOne();
    return user;
  }
  async selectUsersByIdx(usersIdx: number[]): Promise<User[]> {
    const users = await this.createQueryBuilder().whereInIds(usersIdx).getMany();
    return users;
  }

  async selectUserByEmail(email: string): Promise<User> {
    const user = await this.findOne({
      where: { email: email },
      withDeleted: true,
      select: ['email'],
    });
    return user;
  }
  async selectUserByNickname(nickname: string): Promise<User> {
    const user = await this.findOne({
      where: { nickname: nickname },
      withDeleted: true,
      select: ['nickname'],
    });
    return user;
  }
}
