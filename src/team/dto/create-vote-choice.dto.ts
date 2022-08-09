import { ArrayNotEmpty, IsNumber } from 'class-validator';

export class CreateVoteChoiceDto {
  @IsNumber({}, { each: true })
  @ArrayNotEmpty()
  readonly choices: number[];
}
