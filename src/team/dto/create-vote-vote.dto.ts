import { ArrayNotEmpty, IsNumber } from 'class-validator';

export class CreateVoteVoteDto {
  @IsNumber({}, { each: true })
  @ArrayNotEmpty()
  readonly choices: number[];
}
