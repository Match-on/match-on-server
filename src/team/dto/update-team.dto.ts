import { PartialType, PickType } from '@nestjs/mapped-types';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CreateTeamDto } from './create-team.dto';

export class UpdateTeamDto extends PickType(PartialType(CreateTeamDto), ['name']) {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  readonly description: string;
}
