import { Lecture } from 'src/entity/lecture.entity';
import { EntityRepository, Like, Repository } from 'typeorm';

@EntityRepository(Lecture)
export class LectureRepository extends Repository<Lecture> {
  async findLectures(
    univIdx: number,
    offset: number,
    keyword?: string,
    type?: string,
    grade?: number,
    year?: number,
    semester?: number,
  ): Promise<any> {
    let query = this.createQueryBuilder('l')
      .where({ univ: univIdx })
      .offset(offset)
      .limit(10)
      .leftJoin('l.favorites', 'f');
    if (!!keyword) {
      query = query.andWhere({ name: Like(`%${keyword}%`) });
    }
    if (!!type) {
      query = query.andWhere({ type });
    }
    if (!!grade && grade != 0) {
      query = query.orWhere({ grade }).orWhere({ grade: 0 });
    } else if (grade == 0) {
      query = query.andWhere({ grade: 0 });
    }
    if (!!year) {
      query = query.andWhere({ year });
    }
    if (!!semester) {
      query = query.andWhere({ semester });
    }
    const lectures = query
      .select([
        'l.lectureIdx as lectureIdx',
        'l.type as type',
        'l.department as department',
        'l.instructor as instructor',
        'l.grade as grade',
        'l.year as year',
        'l.semester as semester',
        'l.credit as credit',
        'l.time as time',
      ])
      .addSelect('if(f.userIdx is null, 0, 1) as favorite')
      .getRawMany();
    return lectures;
  }
}
