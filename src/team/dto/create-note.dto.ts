import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  readonly title: string;
  @IsString()
  @IsNotEmpty()
  readonly body: string;
  @IsString({ each: true })
  @IsOptional()
  readonly files: string[];
  @ValidateNested({ each: true })
  @Type(() => TaskDto)
  @IsOptional()
  readonly tasks: TaskDto[];
}

class TaskDto {
  @IsNumber()
  @IsNotEmpty()
  readonly memberIdx: number;
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  readonly description: string;
}
