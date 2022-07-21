import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { baseResponse } from 'src/config/baseResponseStatus';
import { response, errResponse } from 'src/config/response';
import { User } from 'src/entity/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(private userService: UserService, private jwtService: JwtService) {}

  async checkStatus(userIdx: number) {
    const user = await this.userService.findOneByIdx(userIdx);
    if (!user) return errResponse(baseResponse.NOT_EXIST_USER);
    else if (user.deletedAt !== null) return errResponse(baseResponse.WITHDRAWAL_USER);
    else if (user.status === 'N') return errResponse(baseResponse.DEACTIVATED_USER);
  }

  async validateUser(id: string, password: string): Promise<User> {
    const user = await this.userService.findOneById(id);
    if (!user) errResponse(baseResponse.NOT_EXIST_USER);
    else if (user.deletedAt !== null) errResponse(baseResponse.WITHDRAWAL_USER);
    else if (user.status === 'N') errResponse(baseResponse.DEACTIVATED_USER);

    const compareResult = await compare(password, user.password);
    if (!compareResult) {
      errResponse(baseResponse.SIGNIN_PASSWORD_WRONG);
    } else {
      return user;
    }
  }

  async login(user: any) {
    const jwt = this.jwtService.sign({ userIdx: user.userIdx, univIdx: user.univUnivIdx || null, role: 'user' });
    return response(baseResponse.SUCCESS, { userIdx: user.userIdx, token: jwt });
  }
}
