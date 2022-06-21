import { IsDateString, IsEmpty, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTeamDto {
  @IsEmpty()
  public id: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  readonly name: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  readonly type: string;
  @IsDateString()
  @IsOptional()
  readonly deadline: Date;
}
