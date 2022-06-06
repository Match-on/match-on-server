import { Body, Controller, Post } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { baseResponse } from 'src/config/baseResponseStatus';
import { errResponse, response } from 'src/config/response';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService, private jwtService: JwtService) {}

  @Post()
  async createUser(@Body() createUserData: CreateUserDto): Promise<object> {
    const user = await this.userService.createUser(createUserData);
    const jwt = this.jwtService.sign({ userIdx: user.userIdx, role: 'user' });

    if (user) {
      return response(baseResponse.SUCCESS, { userIdx: user.userIdx, jwt: jwt });
    } else {
      return errResponse(baseResponse.SERVER_ERROR);
    }
  }
}
