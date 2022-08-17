import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

enum Sort {
  LATEST = 'latest',
  ALPHA = 'alpha',
}

export class ReadVoteDto {
  @IsNotEmpty()
  @IsEnum(Sort)
  readonly sort: string;
  // @IsOptional()
  // @IsString()
  // readonly cursor: string;
  @IsOptional()
  @IsString()
  readonly keyword: string;
}
