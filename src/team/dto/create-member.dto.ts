import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateMemeberDto {
  @IsNumber()
  @IsNotEmpty()
  readonly userIdx: number;
  @IsNumber()
  @IsNotEmpty()
  readonly teamIdx: number;
}
