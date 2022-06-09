import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { baseResponse } from 'src/config/baseResponseStatus';
import { errResponse, response } from 'src/config/response';
import { User } from 'src/user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService, private jwtService: JwtService) {}

  @Post()
  async createUser(@Body() createUserData: CreateUserDto): Promise<object> {
    const userResult = await this.userService.createUser(createUserData);
    const jwt = this.jwtService.sign({ userIdx: userResult.userIdx, role: 'user' });

    if (userResult) {
      return response(baseResponse.SUCCESS, { userIdx: userResult.userIdx, jwt: jwt });
    } else {
      return errResponse(baseResponse.SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:userIdx')
  async readUser(@User() user: any, @Param('userIdx', ParseIntPipe) userIdx: number) {
    if (user.userIdx !== userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }

    const userResult = await this.userService.findOneByIdx(userIdx);

    if (userResult) {
      return response(baseResponse.SUCCESS, userResult);
    } else {
      return errResponse(baseResponse.NOT_EXIST_USER);
    }
  }
}
