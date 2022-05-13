import { Body, Controller, Post } from '@nestjs/common';
import { baseResponse } from 'src/config/baseResponseStatus';
import { errResponse, response } from 'src/config/response';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserData: CreateUserDto): Promise<object> {
    const resultUser = await this.userService.createUser(createUserData);

    if (resultUser) {
      return response(baseResponse.SUCCESS, { userIdx: resultUser.userIdx });
    } else {
      return errResponse(baseResponse.SERVER_ERROR);
    }
  }
}
