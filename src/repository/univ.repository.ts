import { Univ } from 'src/entity/univ.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(Univ)
export class UnivRepository extends Repository<Univ> {}
