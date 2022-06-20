import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTeamRepository } from 'src/repository/user_team.repository';
import { TeamRepository } from 'src/repository/team.repository';
import { UserModule } from 'src/user/user.module';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';

@Module({
  imports: [TypeOrmModule.forFeature([TeamRepository]), TypeOrmModule.forFeature([UserTeamRepository]), UserModule],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}
