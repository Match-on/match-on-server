import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVoteChoiceDto {
  @IsNotEmpty()
  @IsString()
  readonly description: string;
  @IsOptional()
  @IsString()
  readonly imageUrl: string;
}
