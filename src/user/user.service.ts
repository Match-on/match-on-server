import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { baseResponse } from 'src/config/baseResponseStatus';
import { errResponse, response } from 'src/config/response';
import { User } from 'src/entity/user.entity';
import { UserRepository } from 'src/repository/user.repository';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectRepository(UserRepository) private userRepository: UserRepository) {}
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    await Promise.all([this.checkId(createUserDto.id), this.checkEmail(createUserDto.email)]);
    const result = await this.userRepository.insertUser(createUserDto);
    return result;
  }

  async checkId(id: string): Promise<object> {
    const checkResult = await this.userRepository.selectUserById(id);

    if (checkResult) errResponse(baseResponse.SIGNUP_REDUNDANT_ID);
    else return response(baseResponse.SIGNUP_ID_OK, null);
  }

  async checkEmail(email: string): Promise<object> {
    const checkResult = await this.userRepository.selectUserByEmail(email);

    if (checkResult) errResponse(baseResponse.SIGNUP_REDUNDANT_EMAIL);
    else return response(baseResponse.SIGNUP_EMAIL_OK, null);
  }
}
