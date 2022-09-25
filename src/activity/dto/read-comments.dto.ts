import { IsOptional, IsString } from 'class-validator';

export class ReadCommentDto {
  @IsOptional()
  @IsString()
  readonly cursor: string;
}
