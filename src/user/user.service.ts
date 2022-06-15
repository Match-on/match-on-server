import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { baseResponse } from 'src/config/baseResponseStatus';
import { errResponse, response } from 'src/config/response';
import { User } from 'src/entity/user.entity';
import { UserRepository } from 'src/repository/user.repository';
import { UpdateResult } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(UserRepository) private userRepository: UserRepository) {}
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
    console.log(updateResult);
    return updateResult;
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
}
