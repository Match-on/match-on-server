import { IsNotEmpty, IsString } from 'class-validator';

export class ReadDriveDto {
  @IsNotEmpty()
  @IsString()
  readonly keyword: string;
}
