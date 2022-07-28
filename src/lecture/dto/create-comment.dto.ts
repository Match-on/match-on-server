import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

enum Type {
  FREE = 'free',
  INFO = 'info',
  TEAM = 'team',
}

export class CreateCommentDto {
  @IsNotEmpty()
  @IsEnum(Type)
  @MaxLength(10)
  readonly type: string;
  @IsString()
  @IsNotEmpty()
  readonly comment: string;
  @IsNumber()
  @IsOptional()
  readonly parentIdx: number;
}
