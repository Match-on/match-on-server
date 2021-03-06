import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { baseResponse } from 'src/config/baseResponseStatus';
import { errResponse, response } from 'src/config/response';
import { EmailService } from 'src/email/email.service';
import { User } from 'src/user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { UserService } from './user.service';
import { VerifyCodeDto } from './dto/verify-code.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  @Post()
  async postUser(@Body() createUserData: CreateUserDto): Promise<object> {
    const userResult = await this.userService.createUser(createUserData);
    const jwt = this.jwtService.sign({ userIdx: userResult.userIdx, role: 'user' });

    if (userResult) {
      return response(baseResponse.SUCCESS, { userIdx: userResult.userIdx, jwt: jwt });
    } else {
      return errResponse(baseResponse.SERVER_ERROR);
    }
  }

  @Post('/code')
  async sendVerificationCode(@Body() verifyEmailData: SendEmailDto): Promise<object> {
    const code = await this.userService.generateCode(verifyEmailData.email);

    const result = await this.emailService.sendMailVerificationCode(verifyEmailData.email, code);
    if (result === true) {
      return response(baseResponse.SUCCESS);
    } else {
      return errResponse(baseResponse.SERVER_ERROR);
    }
  }

  @Post('/verify')
  async verifyCode(@Body() verifyCodeData: VerifyCodeDto): Promise<object> {
    const { email, code } = verifyCodeData;
    const result = await this.userService.verifyCode(email, code);

    if (result === true) {
      return response(baseResponse.SUCCESS);
    } else if (result === false) {
      return errResponse(baseResponse.CODE_VERIFICATION_FAILURE);
    } else {
      return errResponse(baseResponse.SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:userIdx')
  async getUser(@User() user: any, @Param('userIdx', ParseIntPipe) userIdx: number) {
    if (user.userIdx !== userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }

    const userResult = await this.userService.findOneByIdx(userIdx);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { countryCode, birth, status, enrolledAt, updatedAt, deletedAt, ...result } = userResult;

    if (!userResult) {
      return errResponse(baseResponse.SERVER_ERROR);
    } else {
      return response(baseResponse.SUCCESS, result);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/:userIdx')
  async patchUser(
    @User() user: any,
    @Param('userIdx', ParseIntPipe) userIdx: number,
    @Body() updateUserData: UpdateUserDto,
  ) {
    if (user.userIdx !== userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }

    const userResult = await this.userService.findOneByIdx(userIdx);
    if (!userResult) {
      return errResponse(baseResponse.NOT_EXIST_USER);
    } else if (!!userResult.deletedAt) {
      return errResponse(baseResponse.WITHDRAWAL_USER);
    }

    const updateResult = await this.userService.updateUser(userIdx, updateUserData);
    if (updateResult.affected == 1) {
      return response(baseResponse.SUCCESS, { userIdx });
    } else {
      return errResponse(baseResponse.DB_ERROR);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/:userIdx')
  async deleteUser(@User() user: any, @Param('userIdx', ParseIntPipe) userIdx: number) {
    if (user.userIdx !== userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }

    const userResult = await this.userService.findOneByIdx(userIdx);
    if (!userResult) {
      return errResponse(baseResponse.NOT_EXIST_USER);
    } else if (!!userResult.deletedAt) {
      return errResponse(baseResponse.WITHDRAWAL_USER);
    }

    const deleteResult = await this.userService.deleteUser(userIdx);
    if (deleteResult.affected == 1) {
      return response(baseResponse.SUCCESS, { userIdx });
    } else {
      return errResponse(baseResponse.DB_ERROR);
    }
  }
}
