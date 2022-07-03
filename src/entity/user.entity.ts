import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import { Member } from './member.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  userIdx: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  id: string;
  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;
  @Column({ type: 'text', select: false })
  password: string;
  @Column({ type: 'varchar', length: 10 })
  name: string;
  @Column({ type: 'varchar', length: 20, unique: true })
  nickname: string;
  @Column({ type: 'text', nullable: true })
  profileUrl: string;
  @Column({ type: 'varchar', length: 5, nullable: true })
  countryCode: string;
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;
  @Column({ type: 'date', nullable: true })
  birth: Date;
  @Column({ type: 'boolean', default: true })
  emailAgree: boolean;
  @Column({ type: 'year', nullable: true, default: null })
  enrolledAt: number;

  @Column({ type: 'char', default: 'Y' })
  status: string;
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  accessedAt: Date;
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;

  @OneToMany(() => Member, (userTeam) => userTeam.user)
  teams: Member[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    try {
      if (this.password) {
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;
      }
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
