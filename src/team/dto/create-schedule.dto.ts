import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  readonly title: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  readonly body: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  readonly color: string;
  @IsDateString()
  @IsNotEmpty()
  readonly startTime: Date;
  @IsDateString()
  @IsNotEmpty()
  readonly endTime: Date;
}
