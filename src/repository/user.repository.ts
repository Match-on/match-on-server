import { User } from 'src/entity/user.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
// import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async insertUser(createUserDto: CreateUserDto): Promise<User> {
    const user: User = this.create(createUserDto);
    const result: User = await this.save(user);
    return result;
  }

  async selectUserById(id: string): Promise<User> {
    const user = await this.createQueryBuilder()
      .where('id = :id', { id: id })
      .withDeleted()
      .select('user.*')
      .getRawOne();
    return user;
  }

  async selectUserByIdx(userIdx: number): Promise<User> {
    const user = await this.createQueryBuilder().where('userIdx = :userIdx', { userIdx: userIdx }).getOne();
    return user;
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

  // async selectUserInfo(userIdx: number): Promise<User> {
  //   const user = await this.findOne(userIdx, {
  //     select: ['email', 'firstName', 'lastName', 'profileUrl'],
  //   });
  //   return user;
  // }

  // async updateUser(
  //   userIdx: number,
  //   updateUser: UpdateUserDto,
  // ): Promise<object> {
  //   const user = await this.findOne(userIdx);
  //   Object.keys(updateUser).forEach((key) => {
  //     user[key] = updateUser[key];
  //   });
  //   await this.save(user);
  //   const { email, firstName, lastName, profileUrl } = user;
  //   return { email, firstName, lastName, profileUrl };
  // }
}
