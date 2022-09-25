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
import { ActivityService } from './activity.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateResumeDto } from './dto/create-resume.dto';
import { ReadCommentDto } from './dto/read-comments.dto';
import { ReadPostDto } from './dto/read-post.dto';
import { SearchActivityDto } from './dto/search-activity.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get('/search')
  async searchActivity(
    @User() user: any,
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    query: SearchActivityDto,
  ): Promise<object> {
    const activityResult = await this.activityService.readActivities(user.userIdx, query);

    return response(baseResponse.SUCCESS, activityResult);
  }

  @Get('/filter')
  async getFilter(): Promise<object> {
    const activityFilter = await this.activityService.readFilter();
    return response(baseResponse.SUCCESS, activityFilter);
  }

  @Post('/favorites')
  async postFavorite(@User() user: any, @Body() createFavoriteData: CreateFavoriteDto): Promise<object> {
    const activityIdx = createFavoriteData.activityIdx;

    await this.activityService.createFavorite(user.userIdx, activityIdx);
    return response(baseResponse.SUCCESS);
  }

  @Get('/favorites')
  async getFavorites(@User() user: any): Promise<object> {
    const favoriteActivity = await this.activityService.readFavorites(user.userIdx);
    return response(baseResponse.SUCCESS, favoriteActivity);
  }

  @Delete('/favorites/:activityIdx')
  async deleteFavorite(@User() user: any, @Param('activityIdx', ParseIntPipe) activityIdx: number): Promise<object> {
    await this.activityService.deleteFavorite(user.userIdx, activityIdx);
    return response(baseResponse.SUCCESS);
  }

  @Get('/:activityIdx/name')
  async getActivityName(@User() user: any, @Param('activityIdx', ParseIntPipe) activityIdx: number): Promise<object> {
    const activity = await this.activityService.readActivity(activityIdx);

    return response(baseResponse.SUCCESS, { name: activity.title });
  }

  @Get('/:activityIdx')
  async getActivityDetail(@User() user: any, @Param('activityIdx', ParseIntPipe) activityIdx: number): Promise<object> {
    const posts = await this.activityService.readActivityDetail(activityIdx, user.userIdx);
    return response(baseResponse.SUCCESS, posts);
  }

  @Get('/:activityIdx/posts')
  async getPosts(
    @User() user: any,
    @Param('activityIdx', ParseIntPipe) activityIdx: number,
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    query: ReadPostDto,
  ): Promise<object> {
    const posts = await this.activityService.readPosts(activityIdx, query);
    return response(baseResponse.SUCCESS, posts);
  }

  @Post('/:activityIdx/posts')
  async postPost(
    @User() user: any,
    @Param('activityIdx', ParseIntPipe) activityIdx: number,
    @Body() createPostData: CreatePostDto,
  ): Promise<object> {
    await this.activityService.createPost(user.userIdx, activityIdx, createPostData);
    return response(baseResponse.SUCCESS);
  }
  @Get('/posts/:activityPostIdx')
  async getPost(@User() user: any, @Param('activityPostIdx', ParseIntPipe) activityPostIdx: number): Promise<object> {
    const post = await this.activityService.readPost(user.userIdx, activityPostIdx);
    return response(baseResponse.SUCCESS, post);
  }
  @Patch('/posts/:activityPostIdx')
  async patchPosts(
    @User() user: any,
    @Param('activityPostIdx', ParseIntPipe) activityPostIdx: number,
    @Body() updatePostData: UpdatePostDto,
  ): Promise<object> {
    await this.activityService.updatePost(user.userIdx, activityPostIdx, updatePostData);
    return response(baseResponse.SUCCESS);
  }
  @Delete('/posts/:activityPostIdx')
  async deletePosts(
    @User() user: any,
    @Param('activityPostIdx', ParseIntPipe) activityPostIdx: number,
  ): Promise<object> {
    await this.activityService.deletePost(user.userIdx, activityPostIdx);
    return response(baseResponse.SUCCESS);
  }
  @Get('/:activityIdx/comments')
  async getActivityComment(
    @User() user: any,
    @Param('activityIdx', ParseIntPipe) activityIdx: number,
    @Query(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
      }),
    )
    query: ReadCommentDto,
  ): Promise<object> {
    const comments = await this.activityService.readActivityComment(user.userIdx, activityIdx, query.cursor);
    return response(baseResponse.SUCCESS, comments);
  }
  @Post('/:activityIdx/comments')
  async postActivityComment(
    @User() user: any,
    @Param('activityIdx', ParseIntPipe) activityIdx: number,
    @Body() createCommentData: CreateCommentDto,
  ): Promise<object> {
    const { comment, parentIdx } = createCommentData;
    await this.activityService.createActivityComment(user.userIdx, activityIdx, comment, parentIdx);
    return response(baseResponse.SUCCESS);
  }
  @Patch('/comments/:commentIdx')
  async patchActivityComment(
    @User() user: any,
    @Param('commentIdx', ParseIntPipe) commentIdx: number,
    @Body() updateCommentData: UpdateCommentDto,
  ): Promise<object> {
    await this.activityService.updateActivityComment(user.userIdx, commentIdx, updateCommentData.comment);
    return response(baseResponse.SUCCESS);
  }
  @Delete('/comments/:commentIdx')
  async deleteActivityComment(
    @User() user: any,
    @Param('commentIdx', ParseIntPipe) commentIdx: number,
  ): Promise<object> {
    await this.activityService.deleteActivityComment(user.userIdx, commentIdx);
    return response(baseResponse.SUCCESS);
  }

  @Post('/posts/:activityPostIdx/comments')
  async postPostComment(
    @User() user: any,
    @Param('activityPostIdx', ParseIntPipe) activityPostIdx: number,
    @Body() createCommentData: CreateCommentDto,
  ): Promise<object> {
    const { comment, parentIdx } = createCommentData;
    await this.activityService.createPostComment(user.userIdx, activityPostIdx, comment, parentIdx);
    return response(baseResponse.SUCCESS);
  }
  @Patch('/posts/comments/:commentIdx')
  async patchPostComment(
    @User() user: any,
    @Param('commentIdx', ParseIntPipe) commentIdx: number,
    @Body() updateCommentData: UpdateCommentDto,
  ): Promise<object> {
    await this.activityService.updatePostComment(user.userIdx, commentIdx, updateCommentData.comment);
    return response(baseResponse.SUCCESS);
  }
  @Delete('/posts/comments/:commentIdx')
  async deletePostComment(@User() user: any, @Param('commentIdx', ParseIntPipe) commentIdx: number): Promise<object> {
    await this.activityService.deletePostComment(user.userIdx, commentIdx);
    return response(baseResponse.SUCCESS);
  }

  @Post('/posts/:activityPostIdx/resumes')
  async postResume(
    @User() user: any,
    @Param('activityPostIdx', ParseIntPipe) activityPostIdx: number,
    @Body() createResumeData: CreateResumeDto,
  ): Promise<object> {
    await this.activityService.createResume(user.userIdx, activityPostIdx, createResumeData.body);
    return response(baseResponse.SUCCESS);
  }
}
