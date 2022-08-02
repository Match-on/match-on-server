import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

enum Sort {
  LATEST = 'latest',
  POPULAR = 'popular',
}

export class ReadStudyDto {
  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @IsNumber({}, { each: true })
  readonly categoryIdx?: number[];
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  readonly regionIdx: number;
  @IsNotEmpty()
  @IsEnum(Sort)
  readonly sort: string;
  @IsOptional()
  @IsString()
  readonly cursor: string;
  @IsOptional()
  @IsString()
  readonly keyword: string;
}
