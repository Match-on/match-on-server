import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { baseResponse } from 'src/config/baseResponseStatus';
import { errResponse } from 'src/config/response';
import { Lecture } from 'src/entity/lecture.entity';
import { LecturePostCommentRepository } from 'src/repository/lecture-post-comment.repository';
import { LecturePostRepository } from 'src/repository/lecture-post.repository';
import { LectureRepository } from 'src/repository/lecture.repository';
import { UserService } from 'src/user/user.service';
import { DeleteResult, UpdateResult } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { ReadPostDto } from './dto/read-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class LectureService {
  constructor(
    @InjectRepository(LectureRepository) private lectureRepository: LectureRepository,
    @InjectRepository(LecturePostRepository) private lecturePostRepository: LecturePostRepository,
    @InjectRepository(LecturePostCommentRepository) private lecturePostCommentRepository: LecturePostCommentRepository,
    private userService: UserService,
  ) {}

  async readLecture(lectureIdx: number): Promise<Lecture> {
    const lecture = await this.lectureRepository.findOne(lectureIdx);

    if (!lecture || lecture.status != 'Y') {
      return errResponse(baseResponse.NOT_EXIST_LECTURE);
    }
    return lecture;
  }

  async readLectures(
    userIdx: number,
    offset: number,
    keyword?: string,
    type?: string,
    grade?: number,
    year?: number,
    semester?: number,
  ): Promise<any> {
    const univIdx = (await (await this.userService.findOneByIdx(userIdx)).univ).univIdx;
    const lectures = await this.lectureRepository.findLectures(univIdx, offset, keyword, type, grade, year, semester);

    lectures.forEach((lecture) => {
      lecture.favorite = parseInt(lecture.favorite);
    });
    return lectures;
  }

  async readFilter(userIdx: number): Promise<any> {
    const distinctFilters = await this.lectureRepository
      .createQueryBuilder()
      .from('user', 'u')
      .where({ userIdx })
      .leftJoin('u.univ', 'un')
      .leftJoin('un.lectures', 'l')
      .select(['l.type as type', 'l.grade as grade', 'l.year as year', 'l.semester as semester'])
      .distinct(true)
      .getRawMany();
    const filter = {
      types: new Set(),
      grades: new Set(),
      years: new Set(),
      semesters: new Set(),
    };
    distinctFilters.forEach((f) => {
      filter.types.add(f.type);
      filter.grades.add(f.grade);
      filter.years.add(f.year);
      filter.semesters.add(f.semester);
    });
    Object.entries(filter).forEach(([key, value]) => {
      filter[key] = [...value].sort();
    });
    return filter;
  }

  async createFavorite(userIdx: number, lectureIdx: number): Promise<void> {
    await this.readLecture(lectureIdx);
    await this.lectureRepository.upsertFavorite(userIdx, lectureIdx);
  }

  async readFavorites(userIdx: number): Promise<Lecture[]> {
    const favoriteLectures = await this.lectureRepository.findFavorites(userIdx);
    return favoriteLectures;
  }

  async deleteFavorite(userIdx: number, lectureIdx: number): Promise<void> {
    await this.readLecture(lectureIdx);
    await this.lectureRepository.deleteFavorite(userIdx, lectureIdx);
  }

  async readPosts(lectureIdx: number, query: ReadPostDto): Promise<any> {
    await this.readLecture(lectureIdx);
    const { type, sort, cursor, keyword } = query;
    const result = await this.lecturePostRepository.findWithQuery(lectureIdx, type, sort, cursor, keyword);
    return result;
  }
  async createPost(userIdx: number, lectureIdx: number, createPostData: CreatePostDto): Promise<void> {
    await this.readLecture(lectureIdx);
    const post = await this.lecturePostRepository.insertPost({ userIdx }, { lectureIdx }, createPostData);
    if (createPostData.type == 'free') {
      await this.lecturePostCommentRepository.initAnonyname(userIdx, post.lecturePostIdx);
    }
  }
  async readPost(userIdx: number, lecturePostIdx: number): Promise<any> {
    const result = await this.lecturePostRepository.findByIdx(userIdx, lecturePostIdx);

    if (result.raw.length == 0) {
      return errResponse(baseResponse.NOT_EXIST_LECTURE_POST);
    }
    await this.createPostHit(userIdx, lecturePostIdx);

    let post: any = result.entities[0];
    const { writerIdx, writer, profileUrl, hitCount, commentCount, isMe } = result.raw[0];
    post = { writer, profileUrl, hitCount, commentCount, isMe, ...post };
    if (!!post.comments) {
      post.comments.forEach((comment) => {
        comment['isMe'] = comment.user.userIdx == userIdx ? '1' : '0';
        comment['isWriter'] = comment.user.userIdx == writerIdx ? '1' : '0';
        if (result.raw[0]['type'] == 'free') {
          const anonyname = comment.user.lecturePostAnonynames[0].anonyname;
          comment['name'] = comment.isWriter == '1' ? '글쓴이' : '익명 ' + anonyname;
          comment['profileUrl'] = null;
        } else {
          comment['name'] = comment.user.nickname;
          comment['profileUrl'] = comment.user.profileUrl;
        }
        delete comment['user'];
        comment.childComments.forEach((child) => {
          child['isMe'] = child.user.userIdx == userIdx ? '1' : '0';
          child['isWriter'] = child.user.userIdx == writerIdx ? '1' : '0';
          if (result.raw[0]['type'] == 'free') {
            const anonyname = child.user.lecturePostAnonynames[0].anonyname;
            child['name'] = child.isWriter == '1' ? '글쓴이' : '익명 ' + anonyname;
            child['profileUrl'] = null;
          } else {
            child['name'] = child.user.nickname;
            child['profileUrl'] = child.user.profileUrl;
          }
          delete child['user'];
        });
      });
    }
    if (result.raw[0]['type'] == 'team' && result.raw[0]['isMe'] == 1) {
      const resumes = await this.lecturePostRepository.findResumes(lecturePostIdx);
      post['resumes'] = resumes;
    }

    return post;
  }
  async updatePost(userIdx: number, lecturePostIdx: number, updatePostData: UpdatePostDto): Promise<UpdateResult> {
    const post = await this.checkPost(lecturePostIdx);
    if (post.userIdx != userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }
    const updateResult = await this.lecturePostRepository.update(lecturePostIdx, updatePostData);
    return updateResult;
  }
  async deletePost(userIdx: number, lecturePostIdx: number): Promise<DeleteResult> {
    const post = await this.checkPost(lecturePostIdx);
    if (post.userIdx != userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }
    const deleteResult = await this.lecturePostRepository.softDelete({ lecturePostIdx });
    return deleteResult;
  }

  async checkPost(lecturePostIdx: number): Promise<{ userIdx: number }> {
    const post = await this.lecturePostRepository
      .createQueryBuilder()
      .where({ lecturePostIdx })
      .select('userUserIdx', 'userIdx')
      .getRawOne();
    if (!post) {
      return errResponse(baseResponse.NOT_EXIST_LECTURE_POST);
    }
    return post;
  }

  async createPostHit(userIdx: number, lecturePostIdx: number): Promise<void> {
    const today = new Date();
    await this.lecturePostRepository.upsertPostHit(userIdx, lecturePostIdx, today.toISOString().substring(0, 10));
  }

  async createComment(
    userIdx: number,
    lecturePostIdx: number,
    type: string,
    comment: string,
    parentIdx?: number,
  ): Promise<void> {
    await this.checkPost(lecturePostIdx);
    if (parentIdx) {
      await this.checkComment(parentIdx);
    }

    if (type == 'free') {
      await this.lecturePostCommentRepository.insertAnonyname(userIdx, lecturePostIdx);
    }
    await this.lecturePostCommentRepository.insertComment(
      { userIdx },
      { lecturePostIdx },
      { comment },
      { commentIdx: parentIdx },
    );
  }
  async updateComment(userIdx: number, commentIdx: number, comment: string): Promise<UpdateResult> {
    const checkResult = await this.checkComment(commentIdx);
    if (checkResult.userIdx != userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }
    const updateResult = await this.lecturePostCommentRepository.update(commentIdx, { comment });
    return updateResult;
  }
  async deleteComment(userIdx: number, commentIdx: number): Promise<DeleteResult> {
    const checkResult = await this.checkComment(commentIdx);
    if (checkResult.userIdx != userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }
    const deleteResult = await this.lecturePostCommentRepository.softDelete({ commentIdx });
    return deleteResult;
  }

  async checkComment(commentIdx: number): Promise<{ userIdx: number }> {
    const comment = await this.lecturePostCommentRepository
      .createQueryBuilder()
      .where({ commentIdx })
      .select('userUserIdx', 'userIdx')
      .getRawOne();
    if (!comment) {
      return errResponse(baseResponse.NOT_EXIST_LECTURE_POST_COMMENT);
    }
    return comment;
  }

  async createResume(userIdx: number, lecturePostIdx: number, body: string): Promise<void> {
    const post = await this.lecturePostRepository.findOne({ where: { lecturePostIdx }, relations: ['user'] });
    console.log(post);
    if (!post) {
      return errResponse(baseResponse.NOT_EXIST_LECTURE_POST);
    } else if (post.type != 'team') {
      return errResponse(baseResponse.WRONG_TYPE_LECTURE_POST);
    } else if (post.user.userIdx == userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }
    await this.lecturePostRepository.insertResume({ userIdx }, { lecturePostIdx }, body);
  }
}
