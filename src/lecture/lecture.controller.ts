import { Controller, Get, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { baseResponse } from 'src/config/baseResponseStatus';
import { response } from 'src/config/response';
import { User } from 'src/user.decorator';
import { SearchLectureDto } from './dto/search-lecture.dto';
import { LectureService } from './lecture.service';

@UseGuards(AuthGuard('jwt'))
@Controller('lectures')
export class LectureController {
  constructor(private readonly lectureService: LectureService) {}

  @UseGuards(AuthGuard('jwt'))
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
}
