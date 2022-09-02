import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDriveFolderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  readonly name: string;
  @IsNumber()
  @IsOptional()
  readonly parentIdx: number;
}
