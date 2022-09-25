import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

enum Sort {
  LATEST = 'latest',
  POPULAR = 'popular',
}

export class ReadPostDto {
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
