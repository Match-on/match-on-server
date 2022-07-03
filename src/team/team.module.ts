import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemberRepository } from 'src/repository/member.repository';
import { TeamRepository } from 'src/repository/team.repository';
import { UserModule } from 'src/user/user.module';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
  imports: [TypeOrmModule.forFeature([TeamRepository]), TypeOrmModule.forFeature([MemberRepository]), UserModule],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}
