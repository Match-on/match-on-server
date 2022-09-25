import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { baseResponse } from 'src/config/baseResponseStatus';
import { errResponse } from 'src/config/response';
import { Activity } from 'src/entity/activity.entity';
import { ActivityCommentRepository } from 'src/repository/activity-comment.repository';
import { ActivityPostCommentRepository } from 'src/repository/activity-post-comment.repository';
import { ActivityPostRepository } from 'src/repository/activity-post.repository';
import { ActivityRepository } from 'src/repository/activity.repository';
import { DeleteResult, UpdateResult } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { ReadPostDto } from './dto/read-post.dto';
import { SearchActivityDto } from './dto/search-activity.dto';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(ActivityRepository) private activityRepository: ActivityRepository,
    @InjectRepository(ActivityPostRepository) private activityPostRepository: ActivityPostRepository,
    @InjectRepository(ActivityCommentRepository) private activityCommentRepository: ActivityCommentRepository,
    @InjectRepository(ActivityPostCommentRepository)
    private activityPostCommentRepository: ActivityPostCommentRepository,
  ) {}

  async readActivity(activityIdx: number): Promise<Activity> {
    const activity = await this.activityRepository.findOne(activityIdx);

    if (!activity || activity.status != 'Y') {
      return errResponse(baseResponse.NOT_EXIST_ACTIVITY);
    }
    return activity;
  }
  async readActivityDetail(activityIdx: number, userIdx: number): Promise<any> {
    const today = new Date();
    await this.activityRepository.upsertActivityHit(userIdx, activityIdx, today.toISOString().substring(0, 10));
    const activity = await this.readActivity(activityIdx);
    const result = {
      activityIdx: activity.activityIdx,
      title: activity.title,
      organizer: activity.organizer,
      target: activity.target,
      reward: activity.reward,
      link: activity.link,
      startTime: activity.startTime,
      endTime: activity.endTime,
      body: activity.body,
      imageUrl: activity.imageUrl,
      category: await activity.category,
      postCount: (await activity.posts).length,
      isFavorite: (await activity.favorites).map((user) => user.userIdx).includes(userIdx) ? 1 : 0,
    };
    return result;
  }

  async readActivities(userIdx: number, query: SearchActivityDto): Promise<any> {
    const { categoryIdx, sort, cursor, keyword } = query;
    let category: Array<number>;
    if (typeof categoryIdx == 'number') {
      category = [categoryIdx];
    } else {
      category = categoryIdx;
    }
    const activities = await this.activityRepository.findWithQuery(userIdx, sort, cursor, keyword, category);

    activities.forEach((a) => {
      a.category = a.category?.split(',') || [];
    });
    return activities;
  }

  async readFilter(): Promise<any> {
    const filter = await this.activityRepository.findFilter();
    return filter;
  }

  async createFavorite(userIdx: number, activityIdx: number): Promise<void> {
    await this.readActivity(activityIdx);
    await this.activityRepository.upsertFavorite(userIdx, activityIdx);
  }

  async readFavorites(userIdx: number): Promise<any> {
    const favoriteActivity = await this.activityRepository.findFavorites(userIdx);
    return favoriteActivity;
  }

  async deleteFavorite(userIdx: number, activityIdx: number): Promise<void> {
    await this.readActivity(activityIdx);
    await this.activityRepository.deleteFavorite(userIdx, activityIdx);
  }

  async readPosts(activityIdx: number, query: ReadPostDto): Promise<any> {
    await this.readActivity(activityIdx);
    const { sort, cursor, keyword } = query;
    const result = await this.activityPostRepository.findWithQuery(activityIdx, sort, cursor, keyword);
    return result;
  }
  async createPost(userIdx: number, activityIdx: number, createPostData: CreatePostDto): Promise<void> {
    await this.readActivity(activityIdx);
    await this.activityPostRepository.insertPost({ userIdx }, { activityIdx }, createPostData);
  }
  async readPost(userIdx: number, activityPostIdx: number): Promise<any> {
    const result = await this.activityPostRepository.findByIdx(userIdx, activityPostIdx);

    if (result.raw.length == 0) {
      return errResponse(baseResponse.NOT_EXIST_ACTIVITY_POST);
    }
    await this.createPostHit(userIdx, activityPostIdx);

    let post: any = result.entities[0];
    const { writerIdx, writer, profileUrl, hitCount, commentCount, isMe, isRecruiting } = result.raw[0];
    post = { writer, profileUrl, hitCount, commentCount, isMe, isRecruiting, ...post };
    if (!!post.comments) {
      post.comments.forEach((comment) => {
        comment['isMe'] = comment.user.userIdx == userIdx ? '1' : '0';
        comment['isWriter'] = comment.user.userIdx == writerIdx ? '1' : '0';
        comment['name'] = comment.user.nickname;
        comment['profileUrl'] = comment.user.profileUrl;
        delete comment['user'];
        comment.childComments.forEach((child) => {
          child['isMe'] = child.user.userIdx == userIdx ? '1' : '0';
          child['isWriter'] = child.user.userIdx == writerIdx ? '1' : '0';
          child['name'] = child.user.nickname;
          child['profileUrl'] = child.user.profileUrl;
          delete child['user'];
        });
      });
    }
    if (result.raw[0]['isMe'] == 1) {
      const resumes = await this.activityPostRepository.findResumes(activityPostIdx);
      post['resumes'] = resumes;
    }

    return post;
  }
  async updatePost(userIdx: number, activityPostIdx: number, updatePostData: any): Promise<UpdateResult> {
    const post = await this.checkPost(activityPostIdx);
    if (post.userIdx != userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }
    const updateResult = await this.activityPostRepository.update(activityPostIdx, updatePostData);
    return updateResult;
  }
  async deletePost(userIdx: number, activityPostIdx: number): Promise<DeleteResult> {
    const post = await this.checkPost(activityPostIdx);
    if (post.userIdx != userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }
    const deleteResult = await this.activityPostRepository.softDelete({ activityPostIdx });
    return deleteResult;
  }

  async checkActivity(activityIdx: number): Promise<any> {
    const activity = await this.activityRepository.createQueryBuilder().where({ activityIdx }).getOne();
    if (!activity) {
      return errResponse(baseResponse.NOT_EXIST_ACTIVITY);
    }
    return activity;
  }
  async checkPost(activityPostIdx: number): Promise<{ userIdx: number }> {
    const post = await this.activityPostRepository
      .createQueryBuilder()
      .where({ activityPostIdx })
      .select('userUserIdx', 'userIdx')
      .getRawOne();
    if (!post) {
      return errResponse(baseResponse.NOT_EXIST_ACTIVITY_POST);
    }
    return post;
  }

  async createPostHit(userIdx: number, activityPostIdx: number): Promise<void> {
    const today = new Date();
    await this.activityPostRepository.upsertPostHit(userIdx, activityPostIdx, today.toISOString().substring(0, 10));
  }

  async checkActivityComment(commentIdx: number): Promise<{ userIdx: number }> {
    const comment = await this.activityCommentRepository
      .createQueryBuilder()
      .where({ commentIdx })
      .select('userUserIdx', 'userIdx')
      .getRawOne();
    if (!comment) {
      return errResponse(baseResponse.NOT_EXIST_ACTIVITY_COMMENT);
    }
    return comment;
  }

  async readActivityComment(userIdx: number, activityIdx: number, cursor: string): Promise<any> {
    await this.checkActivity(activityIdx);
    const result = await this.activityRepository.findComments(userIdx, activityIdx, cursor);
    const cursorSet = {};
    result.raw.forEach((c) => (cursorSet[c.ac_commentIdx] = c.cursor));
    if (!!result.entities[0].comments) {
      result.entities[0].comments.forEach((comment) => {
        comment['isMe'] = comment.user.userIdx == userIdx ? '1' : '0';
        comment['name'] = comment.user.nickname;
        comment['profileUrl'] = comment.user.profileUrl;
        comment['cursor'] = cursorSet[comment.commentIdx];
        delete comment['user'];
        comment.childComments.forEach((child) => {
          child['isMe'] = child.user.userIdx == userIdx ? '1' : '0';
          child['name'] = child.user.nickname;
          child['profileUrl'] = child.user.profileUrl;
          delete child['user'];
        });
      });
    }
    return result.entities[0].comments.slice(0, 10);
  }

  async createActivityComment(userIdx: number, activityIdx: number, comment: string, parentIdx: number): Promise<void> {
    await this.checkActivity(activityIdx);
    if (parentIdx) {
      await this.checkActivityComment(parentIdx);
    }

    await this.activityCommentRepository.insertComment(
      { userIdx },
      { activityIdx },
      { comment },
      { commentIdx: parentIdx },
    );
  }
  async updateActivityComment(userIdx: number, commentIdx: number, comment: string): Promise<UpdateResult> {
    const result = await this.checkActivityComment(commentIdx);
    if (result.userIdx != userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }
    const updateResult = await this.activityCommentRepository.update(commentIdx, { comment });
    return updateResult;
  }
  async deleteActivityComment(userIdx: number, commentIdx: number): Promise<DeleteResult> {
    const result = await this.checkActivityComment(commentIdx);
    if (result.userIdx != userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }
    const deleteResult = await this.activityCommentRepository.softDelete({ commentIdx });
    return deleteResult;
  }

  async checkPostComment(commentIdx: number): Promise<{ userIdx: number }> {
    const comment = await this.activityPostCommentRepository
      .createQueryBuilder()
      .where({ commentIdx })
      .select('userUserIdx', 'userIdx')
      .getRawOne();
    if (!comment) {
      return errResponse(baseResponse.NOT_EXIST_ACTIVITY_POST_COMMENT);
    }
    return comment;
  }

  async createPostComment(userIdx: number, activityPostIdx: number, comment: string, parentIdx: number): Promise<void> {
    await this.checkPost(activityPostIdx);
    if (parentIdx) {
      await this.checkPostComment(parentIdx);
    }

    await this.activityPostCommentRepository.insertComment(
      { userIdx },
      { activityPostIdx },
      { comment },
      { commentIdx: parentIdx },
    );
  }
  async updatePostComment(userIdx: number, commentIdx: number, comment: string): Promise<UpdateResult> {
    const result = await this.checkPostComment(commentIdx);
    if (result.userIdx != userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }
    const updateResult = await this.activityPostCommentRepository.update(commentIdx, { comment });
    return updateResult;
  }
  async deletePostComment(userIdx: number, commentIdx: number): Promise<DeleteResult> {
    const result = await this.checkPostComment(commentIdx);
    if (result.userIdx != userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }
    const deleteResult = await this.activityPostCommentRepository.softDelete({ commentIdx });
    return deleteResult;
  }
  async createResume(userIdx: number, activityPostIdx: number, body: string): Promise<void> {
    const activityPost = await this.activityPostRepository.findOne({ where: { activityPostIdx }, relations: ['user'] });
    if (!activityPost) {
      return errResponse(baseResponse.NOT_EXIST_ACTIVITY_POST);
    } else if (activityPost.user.userIdx == userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }
    await this.activityPostRepository.insertResume({ userIdx }, { activityPostIdx }, body);
  }
}
