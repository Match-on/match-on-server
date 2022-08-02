import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { baseResponse } from 'src/config/baseResponseStatus';
import { errResponse } from 'src/config/response';
import { Region } from 'src/entity/region.entity';
import { StudyCategory } from 'src/entity/study-category.entity';
import { Study } from 'src/entity/study.entity';
import { StudyCommentRepository } from 'src/repository/study-comment.repository';
import { StudyRepository } from 'src/repository/study.repository';
import { UserService } from 'src/user/user.service';
import { createQueryBuilder, DeleteResult, UpdateResult } from 'typeorm';
import { ReadStudyDto } from './dto/read-study.dto';

@Injectable()
export class StudyService {
  constructor(
    @InjectRepository(StudyRepository) private studyRepository: StudyRepository,
    @InjectRepository(StudyCommentRepository) private studyCommentRepository: StudyCommentRepository,
    private userService: UserService,
  ) {}

  async readFilter(): Promise<{ categories: any[]; regions: any[] }> {
    const categories = await createQueryBuilder(StudyCategory, 'sc')
      .select(['sc.categoryIdx', 'sc.category'])
      .getMany();
    const regions = await createQueryBuilder(Region, 'r').select(['r.regionIdx', 'r.region']).getMany();
    return { categories, regions };
  }

  async createFavorite(userIdx: number, studyIdx: number): Promise<void> {
    await this.checkStudy(studyIdx);
    await this.studyRepository.upsertFavorite(userIdx, studyIdx);
  }

  async readFavorites(userIdx: number): Promise<Study[]> {
    const favoriteStudys = await this.studyRepository.findFavorites(userIdx);
    return favoriteStudys;
  }

  async deleteFavorite(userIdx: number, studyIdx: number): Promise<void> {
    await this.studyRepository.deleteFavorite(userIdx, studyIdx);
  }

  async readStudies(query: ReadStudyDto): Promise<any> {
    const { categoryIdx, regionIdx, sort, cursor, keyword } = query;
    let category: Array<number>;
    if (typeof categoryIdx == 'number') {
      category = [categoryIdx];
    } else {
      category = categoryIdx;
    }
    const result = await this.studyRepository.findWithQuery(sort, cursor, keyword, category, regionIdx);
    return result;
  }
  async createStudy(userIdx: number, categoryIdx: number, regionIdx: number, createStudyData: any): Promise<void> {
    await this.studyRepository.insertStudy({ userIdx }, { categoryIdx }, { regionIdx }, createStudyData);
  }
  async readStudy(userIdx: number, studyIdx: number): Promise<any> {
    const result = await this.studyRepository.findByIdx(userIdx, studyIdx);

    if (result.entities.length == 0) {
      return errResponse(baseResponse.NOT_EXIST_STUDY);
    }
    await this.createStudyHit(userIdx, studyIdx);

    let study: any = result.entities[0];
    const { writerIdx, hitCount, commentCount, isMe } = result.raw[0];
    study = { hitCount, commentCount, isMe, ...study };
    if (!!study.comments) {
      study.comments.forEach((comment) => {
        comment['name'] = comment.user.nickname;
        comment['profileUrl'] = comment.user.profileUrl;
        comment['isMe'] = comment.user.userIdx == userIdx ? '1' : '0';
        comment['isWriter'] = comment.user.userIdx == writerIdx ? '1' : '0';

        delete comment['user'];
        comment.childComments.forEach((child) => {
          child['name'] = child.user.nickname;
          child['profileUrl'] = child.user.profileUrl;
          child['isMe'] = child.user.userIdx == userIdx ? '1' : '0';
          child['isWriter'] = child.user.userIdx == writerIdx ? '1' : '0';
          delete child['user'];
        });
      });
    }
    if (study.isMe == 1) {
      const resumes = await this.studyRepository.findResumes(studyIdx);
      study['resumes'] = resumes;
    }

    return study;
  }
  async updateStudy(
    userIdx: number,
    studyIdx: number,
    categoryIdx: number,
    regionIdx: number,
    updateStudyData: any,
  ): Promise<UpdateResult> {
    const study = await this.checkStudy(studyIdx);
    if (study.userIdx != userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }
    if (!!categoryIdx) {
      updateStudyData.category = { categoryIdx };
    }
    if (!!regionIdx) {
      updateStudyData.region = { regionIdx };
    }
    const updateResult = await this.studyRepository.update(studyIdx, updateStudyData);
    return updateResult;
  }
  async deleteStudy(userIdx: number, studyIdx: number): Promise<DeleteResult> {
    const study = await this.checkStudy(studyIdx);
    if (study.userIdx != userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }
    const deleteResult = await this.studyRepository.softDelete({ studyIdx });
    return deleteResult;
  }
  async checkStudy(studyIdx: number): Promise<{ userIdx: number }> {
    const study = await this.studyRepository
      .createQueryBuilder()
      .where({ studyIdx })
      .select('userUserIdx', 'userIdx')
      .getRawOne();
    if (!study) {
      return errResponse(baseResponse.NOT_EXIST_STUDY);
    }
    return study;
  }
  async createStudyHit(userIdx: number, studyIdx: number): Promise<void> {
    const today = new Date();
    await this.studyRepository.upsertStudyHit(userIdx, studyIdx, today.toISOString().substring(0, 10));
  }

  async checkComment(commentIdx: number): Promise<{ userIdx: number }> {
    const comment = await this.studyCommentRepository
      .createQueryBuilder()
      .where({ commentIdx })
      .select('userUserIdx', 'userIdx')
      .getRawOne();
    if (!comment) {
      return errResponse(baseResponse.NOT_EXIST_STUDY_COMMENT);
    }
    return comment;
  }

  async createComment(userIdx: number, studyIdx: number, comment: string, parentIdx: number): Promise<void> {
    await this.checkStudy(studyIdx);
    if (parentIdx) {
      await this.checkComment(parentIdx);
    }

    await this.studyCommentRepository.insertComment({ userIdx }, { studyIdx }, { comment }, { commentIdx: parentIdx });
  }
  async updateComment(userIdx: number, commentIdx: number, comment: string): Promise<UpdateResult> {
    const result = await this.checkComment(commentIdx);
    if (result.userIdx != userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }
    const updateResult = await this.studyCommentRepository.update(commentIdx, { comment });
    return updateResult;
  }
  async deleteComment(userIdx: number, commentIdx: number): Promise<DeleteResult> {
    const result = await this.checkComment(commentIdx);
    if (result.userIdx != userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }
    const deleteResult = await this.studyCommentRepository.softDelete({ commentIdx });
    return deleteResult;
  }

  async createResume(userIdx: number, studyIdx: number, body: string): Promise<void> {
    const study = await this.studyRepository.findOne({ where: { studyIdx }, relations: ['user'] });
    if (!study) {
      return errResponse(baseResponse.NOT_EXIST_STUDY);
    } else if (study.user.userIdx == userIdx) {
      return errResponse(baseResponse.ACCESS_DENIED);
    }
    await this.studyRepository.insertResume({ userIdx }, { studyIdx }, body);
  }
}
