import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

enum Type {
  FREE = 'free',
  INFO = 'info',
  TEAM = 'team',
}
enum Sort {
  LATEST = 'latest',
  POPULAR = 'popular',
}

export class ReadPostDto {
  @IsNotEmpty()
  @IsEnum(Type)
  @MaxLength(10)
  readonly type: string;
  @IsNotEmpty()
  @IsEnum(Sort)
  readonly sort: string;
  @IsOptional()
  @IsString()
  readonly cursor: string;
}
