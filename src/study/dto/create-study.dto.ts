import { IsNotEmpty, IsNumber, IsString, Max } from 'class-validator';

export class CreateStudyDto {
  @IsNotEmpty()
  @IsNumber()
  @Max(1)
  readonly target: number;
  @IsNotEmpty()
  @IsNumber()
  readonly category: number;
  @IsNotEmpty()
  @IsNumber()
  readonly region: number;
  @IsString()
  @IsNotEmpty()
  readonly title: string;
  @IsString()
  @IsNotEmpty()
  readonly body: string;
  @IsNotEmpty()
  @IsNumber()
  @Max(10)
  readonly count: number;
}
