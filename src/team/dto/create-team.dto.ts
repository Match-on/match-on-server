import { IsDateString, IsEmpty, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

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
  @IsNumber()
  @IsNotEmpty()
  readonly index: number;
  @IsDateString()
  @IsOptional()
  readonly deadline: Date;
}
