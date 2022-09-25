import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';
export class CreateActivityDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  readonly title: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  readonly organizer: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  readonly target: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  readonly reward: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  readonly link: string;
  @IsDateString()
  @IsNotEmpty()
  readonly startTime: Date;
  @IsDateString()
  @IsNotEmpty()
  readonly endTime: Date;
  @IsString()
  @IsNotEmpty()
  readonly body: string;
  @IsString()
  @IsNotEmpty()
  readonly imageUrl: string;
}
