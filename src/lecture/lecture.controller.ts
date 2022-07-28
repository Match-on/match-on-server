import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
import { CreatePostDto } from './dto/create-post.dto';
import { ReadPostDto } from './dto/read-post.dto';
import { SearchLectureDto } from './dto/search-lecture.dto';
import { UpdatePostDto } from './dto/update-post.dto';
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

  @Get('/filter')
  async getFilter(@User() user: any): Promise<object> {
    const lectureFilter = await this.lectureService.readFilter(user.userIdx);
    return response(baseResponse.SUCCESS, lectureFilter);
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

  @Get('/:lectureIdx/posts')
  async getPosts(
    @User() user: any,
    @Param('lectureIdx', ParseIntPipe) lectureIdx: number,
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    query: ReadPostDto,
  ): Promise<object> {
    const posts = await this.lectureService.readPosts(lectureIdx, query);
    return response(baseResponse.SUCCESS, posts);
  }
  @Post('/:lectureIdx/posts')
  async postPosts(
    @User() user: any,
    @Param('lectureIdx', ParseIntPipe) lectureIdx: number,
    @Body() createPostData: CreatePostDto,
  ): Promise<object> {
    await this.lectureService.createPost(user.userIdx, lectureIdx, createPostData);
    return response(baseResponse.SUCCESS);
  }
  @Get('/posts/:lecturePostIdx')
  async getPost(@User() user: any, @Param('lecturePostIdx', ParseIntPipe) lecturePostIdx: number): Promise<object> {
    const post = await this.lectureService.readPost(user.userIdx, lecturePostIdx);
    return response(baseResponse.SUCCESS, post);
  }
  @Patch('/posts/:lecturePostIdx')
  async patchPosts(
    @User() user: any,
    @Param('lecturePostIdx', ParseIntPipe) lecturePostIdx: number,
    @Body() updatePostData: UpdatePostDto,
  ): Promise<object> {
    await this.lectureService.updatePost(user.userIdx, lecturePostIdx, updatePostData);
    return response(baseResponse.SUCCESS);
  }
  @Delete('/posts/:lecturePostIdx')
  async deletePosts(@User() user: any, @Param('lecturePostIdx', ParseIntPipe) lecturePostIdx: number): Promise<object> {
    await this.lectureService.deletePost(user.userIdx, lecturePostIdx);
    return response(baseResponse.SUCCESS);
  }
}
