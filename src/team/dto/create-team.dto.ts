import { IsEmpty, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTeamDto {
  @IsEmpty()
  public id: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  readonly name: string;
}
