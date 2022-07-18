import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LectureRepository } from 'src/repository/lecture.repository';
import { UserService } from 'src/user/user.service';

@Injectable()
export class LectureService {
  constructor(
    @InjectRepository(LectureRepository) private lectureRepository: LectureRepository,
    private userService: UserService,
  ) {}

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
    console.log(lectures);

    lectures.forEach((lecture) => (lecture.favorite = parseInt(lecture.favorite)));
    return lectures;
  }
}
