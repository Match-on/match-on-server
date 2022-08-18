import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class ReadScheduleDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly year: number;
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  readonly month: number;
}
