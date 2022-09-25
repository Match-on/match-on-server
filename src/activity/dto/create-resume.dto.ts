import { IsNotEmpty, IsString } from 'class-validator';

export class CreateResumeDto {
  @IsString()
  @IsNotEmpty()
  readonly body: string;
}
