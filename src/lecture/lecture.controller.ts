import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { baseResponse } from 'src/config/baseResponseStatus';
import { response } from 'src/config/response';
import { User } from 'src/user.decorator';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { SearchLectureDto } from './dto/search-lecture.dto';
import { LectureService } from './lecture.service';

@UseGuards(AuthGuard('jwt'))
@Controller('lectures')
export class LectureController {
  constructor(private readonly lectureService: LectureService) {}

  @Get('/search')
  async getLecture(
    @User() user: any,
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    query: SearchLectureDto,
  ): Promise<object> {
    const { offset, keyword, type, grade, when } = query;
    let year: number, semester: number;
    if (when) {
      year = parseInt(when.split('-')[0]);
      semester = parseInt(when.split('-')[1]);
    }
    const lectureResult = await this.lectureService.readLectures(
      user.userIdx,
      offset,
      keyword,
      type,
      grade,
      year,
      semester,
    );

    return response(baseResponse.SUCCESS, lectureResult);
  }

  @Post('/favorites')
  async postFavorite(@User() user: any, @Body() createFavoriteData: CreateFavoriteDto): Promise<object> {
    const lectureIdx = createFavoriteData.lectureIdx;

    await this.lectureService.createFavorite(user.userIdx, lectureIdx);
    return response(baseResponse.SUCCESS);
  }

  @Get('/favorites')
  async getFavorites(@User() user: any): Promise<object> {
    const favoriteLectures = await this.lectureService.readFavorites(user.userIdx);
    return response(baseResponse.SUCCESS, favoriteLectures);
  }

  @Delete('/favorites/:lectureIdx')
  async deleteFavorite(@User() user: any, @Param('lectureIdx', ParseIntPipe) lectureIdx: number): Promise<object> {
    await this.lectureService.deleteFavorite(user.userIdx, lectureIdx);
    return response(baseResponse.SUCCESS);
  }
}
