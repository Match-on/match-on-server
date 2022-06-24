import { IsNumber } from 'class-validator';
import { CreateTeamDto } from './create-team.dto';

export class CreateTeamWithMembersDto extends CreateTeamDto {
  @IsNumber({}, { each: true })
  public members: number[];
}
