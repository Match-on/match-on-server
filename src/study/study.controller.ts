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
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { CreateStudyDto } from './dto/create-study.dto';
import { CreateResumeDto } from './dto/create-resume.dto';
import { ReadStudyDto } from './dto/read-study.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UpdateStudyDto } from './dto/update-post.dto';
import { StudyService } from './study.service';

@UseGuards(AuthGuard('jwt'))
@Controller('studies')
export class StudyController {
  constructor(private readonly studyService: StudyService) {}

  @Get('/filter')
  async getFilter(): Promise<object> {
    const studyFilter = await this.studyService.readFilter();
    return response(baseResponse.SUCCESS, studyFilter);
  }

  @Post('/favorites')
  async postFavorite(@User() user: any, @Body() createFavoriteData: CreateFavoriteDto): Promise<object> {
    const studyPostIdx = createFavoriteData.studyIdx;

    await this.studyService.createFavorite(user.userIdx, studyPostIdx);
    return response(baseResponse.SUCCESS);
  }

  @Get('/favorites')
  async getFavorites(@User() user: any): Promise<object> {
    const favoriteStudies = await this.studyService.readFavorites(user.userIdx);
    return response(baseResponse.SUCCESS, favoriteStudies);
  }

  @Delete('/favorites/:studyIdx')
  async deleteFavorite(@User() user: any, @Param('studyIdx', ParseIntPipe) studyIdx: number): Promise<object> {
    await this.studyService.deleteFavorite(user.userIdx, studyIdx);
    return response(baseResponse.SUCCESS);
  }

  @Get()
  async getStudies(
    @User() user: any,
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    query: ReadStudyDto,
  ): Promise<object> {
    const posts = await this.studyService.readStudies(query);
    return response(baseResponse.SUCCESS, posts);
  }
  @Post()
  async postStudy(@User() user: any, @Body() createPostData: CreateStudyDto): Promise<object> {
    const { target, category, region, title, body, count } = createPostData;
    await this.studyService.createStudy(user.userIdx, category, region, { target, title, body, count });
    return response(baseResponse.SUCCESS);
  }
  @Get('/:studyIdx')
  async getStudy(@User() user: any, @Param('studyIdx', ParseIntPipe) studyIdx: number): Promise<object> {
    const post = await this.studyService.readStudy(user.userIdx, studyIdx);
    return response(baseResponse.SUCCESS, post);
  }
  @Patch('/:studyIdx')
  async patchStudy(
    @User() user: any,
    @Param('studyIdx', ParseIntPipe) studyIdx: number,
    @Body() updateStudyData: UpdateStudyDto,
  ): Promise<object> {
    const { category, region, ...data } = updateStudyData;
    await this.studyService.updateStudy(user.userIdx, studyIdx, category, region, data);
    return response(baseResponse.SUCCESS);
  }
  @Delete('/:studyIdx')
  async deleteStudy(@User() user: any, @Param('studyIdx', ParseIntPipe) studyIdx: number): Promise<object> {
    await this.studyService.deleteStudy(user.userIdx, studyIdx);
    return response(baseResponse.SUCCESS);
  }

  @Post('/:studyIdx/comments')
  async postComment(
    @User() user: any,
    @Param('studyIdx', ParseIntPipe) studyIdx: number,
    @Body() createCommentData: CreateCommentDto,
  ): Promise<object> {
    const { comment, parentIdx } = createCommentData;
    await this.studyService.createComment(user.userIdx, studyIdx, comment, parentIdx);
    return response(baseResponse.SUCCESS);
  }
  @Patch('/comments/:commentIdx')
  async patchComment(
    @User() user: any,
    @Param('commentIdx', ParseIntPipe) commentIdx: number,
    @Body() updateCommentData: UpdateCommentDto,
  ): Promise<object> {
    await this.studyService.updateComment(user.userIdx, commentIdx, updateCommentData.comment);
    return response(baseResponse.SUCCESS);
  }
  @Delete('/comments/:commentIdx')
  async deleteComment(@User() user: any, @Param('commentIdx', ParseIntPipe) commentIdx: number): Promise<object> {
    await this.studyService.deleteComment(user.userIdx, commentIdx);
    return response(baseResponse.SUCCESS);
  }

  @Post('/:studyIdx/resumes')
  async postResume(
    @User() user: any,
    @Param('studyIdx', ParseIntPipe) studyIdx: number,
    @Body() createResumeData: CreateResumeDto,
  ): Promise<object> {
    console.log('here?');
    await this.studyService.createResume(user.userIdx, studyIdx, createResumeData.body);
    return response(baseResponse.SUCCESS);
  }
}
