import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class SearchLectureDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  readonly offset: number;
  @IsOptional()
  @IsString()
  @MaxLength(20)
  readonly keyword?: string;
  @IsOptional()
  @IsString()
  @MaxLength(10)
  readonly type?: string;
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly grade?: number;
  @IsOptional()
  @IsString()
  readonly when?: string;
}
