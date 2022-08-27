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
  @ValidateNested({ each: true })
  @Type(() => FileDto)
  @IsOptional()
  readonly files: FileDto[];
  @ValidateNested({ each: true })
  @Type(() => TaskDto)
  @IsOptional()
  readonly tasks: TaskDto[];
}

class FileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  readonly fileName: string;
  @IsString()
  @IsNotEmpty()
  readonly url: string;
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
