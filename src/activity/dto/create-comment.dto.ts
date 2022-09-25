import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  readonly comment: string;
  @IsNumber()
  @IsOptional()
  readonly parentIdx: number;
}
