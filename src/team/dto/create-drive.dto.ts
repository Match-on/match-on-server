import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

export class CreateDriveDto {
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
  @IsNumber()
  @IsOptional()
  readonly folderIdx: number;
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
