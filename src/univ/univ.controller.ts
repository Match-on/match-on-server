import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { baseResponse } from 'src/config/baseResponseStatus';
import { errResponse, response } from 'src/config/response';
import { User } from 'src/user.decorator';
import { CreateUnivDto } from './dto/create-univ.dto';
import { UpdateUnivDto } from './dto/update-univ.dto';
import { UnivService } from './univ.service';

//TODO: 권한체크
@Controller('univs')
export class UnivController {
  constructor(private readonly univService: UnivService, private jwtService: JwtService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async postUniv(@Body() createUnivData: CreateUnivDto): Promise<object> {
    const univResult = await this.univService.createUniv(createUnivData);
    console.log(univResult);

    if (univResult) {
      return response(baseResponse.SUCCESS, univResult.identifiers[0]);
    } else {
      return errResponse(baseResponse.SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getUnivs(@User() user: any) {
    const univResult = await this.univService.findAll();

    if (univResult) {
      return response(baseResponse.SUCCESS, univResult);
    } else {
      return errResponse(baseResponse.SERVER_ERROR);
    }
  }

  @Get('/search')
  async getUnivsSearch(@User() user: any, @Query('keyword') keyword: string) {
    if (!keyword || keyword.length == 0) {
      return errResponse(baseResponse.SEARCH_KEYWORD_EMPTY);
    }
    const univResult = await this.univService.findByName(keyword);

    if (univResult) {
      return response(baseResponse.SUCCESS, univResult);
    } else {
      return errResponse(baseResponse.SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('/:univIdx')
  async getUniv(@User() univ: any, @Param('univIdx', ParseIntPipe) univIdx: number) {
    const univResult = await this.univService.findOneByIdx(univIdx);

    if (!univResult) {
      return errResponse(baseResponse.NOT_EXIST_UNIV);
    } else {
      return response(baseResponse.SUCCESS, univResult);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/:univIdx')
  async patchUniv(
    @User() univ: any,
    @Param('univIdx', ParseIntPipe) univIdx: number,
    @Body() updateUnivData: UpdateUnivDto,
  ) {
    const updateResult = await this.univService.updateUniv(univIdx, updateUnivData);

    if (updateResult.affected == 1) {
      return response(baseResponse.SUCCESS, { univIdx });
    } else if (updateResult.affected == 0) {
      return response(baseResponse.NOT_EXIST_UNIV);
    } else {
      return errResponse(baseResponse.DB_ERROR);
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/:univIdx')
  async deleteUniv(@User() univ: any, @Param('univIdx', ParseIntPipe) univIdx: number) {
    const deleteResult = await this.univService.deleteUniv(univIdx);
    if (deleteResult.affected == 1) {
      return response(baseResponse.SUCCESS, { univIdx });
    } else if (deleteResult.affected == 0) {
      return response(baseResponse.NOT_EXIST_UNIV);
    } else {
      return errResponse(baseResponse.DB_ERROR);
    }
  }
}
