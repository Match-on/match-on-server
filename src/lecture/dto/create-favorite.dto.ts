import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateFavoriteDto {
  @IsNumber()
  @IsNotEmpty()
  readonly lectureIdx: number;
}
