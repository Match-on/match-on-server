import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Univ } from 'src/entity/univ.entity';
import { UnivRepository } from 'src/repository/univ.repository';
import { DeleteResult, InsertResult, Like, UpdateResult } from 'typeorm';
import { CreateUnivDto } from './dto/create-univ.dto';
import { UpdateUnivDto } from './dto/update-univ.dto';

@Injectable()
export class UnivService {
  constructor(@InjectRepository(UnivRepository) private univRepository: UnivRepository) {}
  async createUniv(createUnivDto: CreateUnivDto): Promise<InsertResult> {
    const result = await this.univRepository.insert(createUnivDto);
    return result;
  }

  async updateUniv(univIdx: number, updateUnivData: UpdateUnivDto): Promise<UpdateResult> {
    const updateResult = await this.univRepository.update(univIdx, updateUnivData);
    return updateResult;
  }

  async deleteUniv(univIdx: number): Promise<DeleteResult> {
    const deleteResult = await this.univRepository.softDelete({ univIdx });
    return deleteResult;
  }

  async findOneByIdx(univIdx: number): Promise<Univ> {
    return this.univRepository.findOne(univIdx);
  }
  async findAll(): Promise<Univ[]> {
    return this.univRepository.find();
  }
  async findByName(keyword: string): Promise<Univ[]> {
    return this.univRepository.find({
      select: ['univIdx', 'name', 'domain'],
      where: { name: Like(`%${keyword}%`), status: 'Y' },
      order: { name: 'ASC' },
    });
  }
}
