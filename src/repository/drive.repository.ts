import { Member } from 'src/entity/member.entity';
import { DriveComment } from 'src/entity/drive-comment.entity';
import { Drive } from 'src/entity/drive.entity';
import { createQueryBuilder, EntityRepository, Like, Repository } from 'typeorm';
import { DriveFolder } from 'src/entity/drive-folder.entity';

@EntityRepository(Drive)
export class DriveRepository extends Repository<Drive> {
  async insertDrive(member: Member, team: any, data: object, files: any[], folder: any): Promise<Drive> {
    const drive: Drive = this.create(data);
    drive.member = member;
    drive.team = team;
    drive.files = files;
    drive.folder = folder;
    const result: Drive = await this.save(drive);
    return result;
  }

  async findDrivesWithKeyword(teamIdx: number, memberIdx: number, keyword: string): Promise<any> {
    const commentQb = createQueryBuilder(DriveComment, 'dc').select('COUNT(*)').where('dc.driveDriveIdx = d.driveIdx');

    const qb = this.createQueryBuilder('d')
      .where({ team: { teamIdx } })
      .leftJoin('d.member', 'm')
      .leftJoin('drive_hit', 'd_h', 'd.driveIdx = d_h.driveDriveIdx AND d_h.memberMemberIdx = :memberIdx', {
        memberIdx,
      })
      .leftJoin('d.files', 'f')
      .select(['driveIdx', 'title', 'd.createdAt as createdAt', 'name'])
      .addSelect('if(d_h.memberMemberIdx IS NULL,true,false) as isNew')
      .addSelect(`(${commentQb.getQuery()}) as commentCount`)
      .addSelect(`group_concat(f.url separator ",") as files`)
      .groupBy('driveIdx')
      .orderBy({ 'd.createdAt': 'DESC', 'd.driveIdx': 'DESC' });

    qb.andWhere([{ title: Like(`%${keyword}%`) }, { body: Like(`%${keyword}%`) }]);
    const drives = qb.getRawMany();
    return drives;
  }
  async findDrivesByIdx(teamIdx: number, memberIdx: number, folderIdx?: number): Promise<any> {
    const commentQb = createQueryBuilder(DriveComment, 'dc').select('COUNT(*)').where('dc.driveDriveIdx = d.driveIdx');
    const state = `d.teamTeamIdx= :teamIdx AND d.folderFolderIdx ${folderIdx ? '=' + `${folderIdx}` : 'IS NULL'}`;
    const qb = this.createQueryBuilder('d')
      .where(state, { teamIdx: teamIdx })
      .leftJoin('d.member', 'm')
      .leftJoin('drive_hit', 'd_h', 'd.driveIdx = d_h.driveDriveIdx AND d_h.memberMemberIdx = :memberIdx', {
        memberIdx,
      })
      .leftJoin('d.files', 'f')
      .select(['driveIdx', 'title', 'd.createdAt as createdAt', 'name'])
      .addSelect('if(d_h.memberMemberIdx IS NULL,true,false) as isNew')
      .addSelect(`(${commentQb.getQuery()}) as commentCount`)
      .addSelect(`group_concat(f.url separator ",") as files`)
      .groupBy('driveIdx')
      .orderBy({ 'd.createdAt': 'DESC', 'd.driveIdx': 'DESC' });

    const drives = qb.getRawMany();
    return drives;
  }

  async findDrive(memberIdx: number, driveIdx: number): Promise<any> {
    const drives = this.createQueryBuilder('d')
      .where({ driveIdx })
      .leftJoin('d.member', 'm')
      .leftJoin('d.team', 't')
      .leftJoin('d.files', 'f')
      .leftJoin('d.comments', 'dc', 'd.driveIdx = dc.drive and dc.parentCommentCommentIdx IS NULL')
      .leftJoin('dc.member', 'dcm')
      .leftJoin('dc.childComments', 'cc')
      .leftJoin('cc.member', 'ccm')
      .select([
        'd.driveIdx',
        'd.title',
        'd.body',
        'd.createdAt',
        'm.name',
        'f.fileName',
        'f.url',
        't.teamIdx',
        'dc.commentIdx',
        'dc.comment',
        'dc.createdAt',
        'dcm.memberIdx',
        'dcm.name',
        'dcm.profileUrl',
        'cc.commentIdx',
        'cc.comment',
        'cc.createdAt',
        'ccm.memberIdx',
        'ccm.name',
        'ccm.profileUrl',
      ])
      .addSelect(`if(d.memberMemberIdx = ${memberIdx}, true, false) as isMe`)
      .orderBy({ 'dc.createdAt': 'ASC', 'cc.createdAt': 'ASC' })
      .getRawAndEntities();

    return drives;
  }

  async upsertDriveHit(memberIdx: number, driveIdx: number): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into('drive_hit')
      .values({ memberMemberIdx: memberIdx, driveDriveIdx: driveIdx })
      .updateEntity(false)
      .orIgnore()
      .execute();
  }
}

@EntityRepository(DriveComment)
export class DriveCommentRepository extends Repository<DriveComment> {
  async insertComment(member: Member, drive: Drive, data: object, parentComment: any): Promise<DriveComment> {
    const comment: DriveComment = this.create(data);
    comment.member = member;
    comment.drive = drive;
    comment.parentComment = parentComment;
    const result: DriveComment = await this.save(comment);
    return result;
  }
  async findComment(commentIdx: number): Promise<any> {
    const comment = await this.createQueryBuilder('c')
      .where({ commentIdx })
      .leftJoin('c.member', 'm')
      .select(['c.memberMemberIdx as memberIdx', 'm.userUserIdx as userIdx'])
      .getRawOne();
    return comment;
  }
}
@EntityRepository(DriveFolder)
export class DriveFolderRepository extends Repository<DriveFolder> {
  async insertDriveFolder(team: any, name: string, folder: any): Promise<DriveFolder> {
    const drive: DriveFolder = this.create({ name });
    drive.team = team;
    drive.parentFolder = folder;
    console.log(folder);
    const result: DriveFolder = await this.save(drive);
    return result;
  }
  async findFoldersWithKeyword(teamIdx: number, keyword: string): Promise<any> {
    const qb = this.createQueryBuilder('df')
      .where({ team: { teamIdx } })
      .select(['name'])
      .leftJoin('df.drives', 'd')
      .addSelect('COUNT(d.driveIdx) as count')
      .groupBy('folderIdx')
      .orderBy({ 'df.createdAt': 'DESC', 'df.folderIdx': 'DESC' });

    qb.andWhere({ name: Like(`%${keyword}%`) });
    const folders = qb.getRawMany();
    return folders;
  }
  async findFoldersByIdx(teamIdx: number, folderIdx?: number): Promise<any> {
    const state = `df.teamTeamIdx= :teamIdx AND df.parentFolderFolderIdx ${
      folderIdx ? '=' + `${folderIdx}` : 'IS NULL'
    }`;
    const qb = this.createQueryBuilder('df')
      .where(state, { teamIdx: teamIdx })
      .select(['folderIdx', 'name'])
      .leftJoin('df.drives', 'd')
      .addSelect('COUNT(d.driveIdx) as count')
      .groupBy('folderIdx')
      .orderBy({ 'df.createdAt': 'DESC', 'df.folderIdx': 'DESC' });
    const folders = qb.getRawMany();
    return folders;
  }
}
