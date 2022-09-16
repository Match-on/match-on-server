import { Member } from 'src/entity/member.entity';
import { NoteComment } from 'src/entity/note-comment.entity';
import { Note } from 'src/entity/note.entity';
import { createQueryBuilder, EntityRepository, Like, Repository } from 'typeorm';

@EntityRepository(Note)
export class NoteRepository extends Repository<Note> {
  async insertNote(member: Member, team: any, data: object, files: any[], tasks: any[]): Promise<Note> {
    const note: Note = this.create(data);
    note.member = member;
    note.team = team;
    note.files = files;
    note.tasks = tasks;
    const result: Note = await this.save(note);
    return result;
  }

  async findNotes(teamIdx: number, memberIdx: number, keyword: string): Promise<any> {
    const commentQb = createQueryBuilder(NoteComment, 'nc').select('COUNT(*)').where('nc.noteNoteIdx = n.noteIdx');

    const qb = this.createQueryBuilder('n')
      .where({ team: { teamIdx } })
      .leftJoin('n.member', 'm')
      .leftJoin('note_hit', 'n_h', 'n.noteIdx = n_h.noteNoteIdx AND n_h.memberMemberIdx = :memberIdx', { memberIdx })
      .leftJoin('n.files', 'f')
      .select(['noteIdx', 'title', 'n.createdAt as createdAt', 'name'])
      .addSelect('if(n_h.memberMemberIdx IS NULL,true,false) as isNew')
      .addSelect(`(${commentQb.getQuery()}) as commentCount`)
      .addSelect(`group_concat(f.url separator ",") as files`)
      .groupBy('noteIdx')
      .orderBy({ 'n.createdAt': 'DESC', 'n.noteIdx': 'DESC' });

    if (!!keyword) {
      qb.andWhere([{ title: Like(`%${keyword}%`) }, { body: Like(`%${keyword}%`) }]);
    }
    const notes = qb.getRawMany();
    return notes;
  }

  async findNote(memberIdx: number, noteIdx: number): Promise<any> {
    const notes = this.createQueryBuilder('n')
      .where({ noteIdx })
      .leftJoin('n.member', 'm')
      .leftJoin('n.team', 't')
      .leftJoin('t.members', 'tm')
      .leftJoin('tm.noteTasks', 'tmt', 'tmt.noteNoteIdx = n.noteIdx')
      .leftJoin('n.files', 'f')
      .leftJoin('n.comments', 'nc', 'n.noteIdx = nc.note and nc.parentCommentCommentIdx IS NULL')
      .leftJoin('nc.member', 'ncm')
      .leftJoin('nc.childComments', 'cc')
      .leftJoin('cc.member', 'ccm')
      .select([
        'n.noteIdx',
        'n.title',
        'n.body',
        'n.createdAt',
        'm.name',
        'f.fileName',
        'f.url',
        't.teamIdx',
        'tm.name',
        'tm.profileUrl',
        'tmt.description',
        'nc.commentIdx',
        'nc.comment',
        'nc.createdAt',
        'ncm.memberIdx',
        'ncm.name',
        'ncm.profileUrl',
        'cc.commentIdx',
        'cc.comment',
        'cc.createdAt',
        'ccm.memberIdx',
        'ccm.name',
        'ccm.profileUrl',
      ])
      .addSelect(`if(n.memberMemberIdx = ${memberIdx}, true, false) as isMe`)
      .orderBy({ 'nc.createdAt': 'ASC', 'cc.createdAt': 'ASC' })
      .getRawAndEntities();
    return notes;
  }

  async upsertNoteHit(memberIdx: number, noteIdx: number): Promise<void> {
    await this.createQueryBuilder()
      .insert()
      .into('note_hit')
      .values({ memberMemberIdx: memberIdx, noteNoteIdx: noteIdx })
      .updateEntity(false)
      .orIgnore()
      .execute();
  }
}

@EntityRepository(NoteComment)
export class NoteCommentRepository extends Repository<NoteComment> {
  async insertComment(member: Member, note: Note, data: object, parentComment: any): Promise<NoteComment> {
    const comment: NoteComment = this.create(data);
    comment.member = member;
    comment.note = note;
    comment.parentComment = parentComment;
    const result: NoteComment = await this.save(comment);
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
