import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreateUnivDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  readonly name: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i)
  readonly domain: string;
}
