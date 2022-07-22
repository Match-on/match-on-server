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
        'l.name as name',
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
  async upsertFavorite(userIdx: number, lectureIdx: number): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into('favorite_lecture')
      .values({ userUserIdx: userIdx, lectureLectureIdx: lectureIdx })
      .orIgnore()
      .execute();
  }

  async findFavorites(userIdx: number): Promise<Lecture[]> {
    const lectures = await this.createQueryBuilder('l')
      .innerJoin('l.favorites', 'u')
      .where('u.userIdx = :userIdx', { userIdx })
      .select(['l.lectureIdx', 'l.name', 'l.type', 'l.instructor', 'l.credit', 'l.time'])
      .getMany();
    return lectures;
  }

  async deleteFavorite(userIdx: number, lectureIdx: number): Promise<void> {
    await this.createQueryBuilder().relation('favorites').of({ lectureIdx }).remove({ userIdx });
  }
}
