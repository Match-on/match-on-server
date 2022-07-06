import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';
import { baseResponse } from 'src/config/baseResponseStatus';
import { errResponse } from 'src/config/response';
import { User } from 'src/entity/user.entity';
import { UserRepository } from 'src/repository/user.repository';
import { DeleteResult, UpdateResult } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository) private userRepository: UserRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    await Promise.all([
      this.checkId(createUserDto.id),
      this.checkEmail(createUserDto.email),
      this.checkNickname(createUserDto.nickname),
    ]);
    const result = await this.userRepository.insertUser(createUserDto);
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
    console.log(await this.cacheManager.get(email), code);

    for (const key of await this.cacheManager.store.keys()) {
      console.log(key + ' : ' + (await this.cacheManager.get(key)));
    }
    return (await this.cacheManager.get(email)) === code;
  }
}
