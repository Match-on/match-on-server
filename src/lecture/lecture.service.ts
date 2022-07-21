import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { baseResponse } from 'src/config/baseResponseStatus';
import { errResponse } from 'src/config/response';
import { Lecture } from 'src/entity/lecture.entity';
import { LectureRepository } from 'src/repository/lecture.repository';
import { UserService } from 'src/user/user.service';

@Injectable()
export class LectureService {
  constructor(
    @InjectRepository(LectureRepository) private lectureRepository: LectureRepository,
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
}
