import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

enum Sort {
  LATEST = 'latest',
  POPULAR = 'popular',
}

export class SearchActivityDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  readonly categoryIdx?: number[] | number;
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
