import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

export class CreateVoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  readonly title: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  readonly description: string;
  @ValidateNested({ each: true })
  @Type(() => ChoiceDto)
  @IsOptional()
  readonly choices: ChoiceDto[];
  @IsDateString()
  @IsOptional()
  readonly endTime: Date;
  @IsBoolean()
  @IsOptional()
  readonly isMultiple: boolean;
  @IsBoolean()
  @IsOptional()
  readonly isAnonymous: boolean;
  @IsBoolean()
  @IsOptional()
  readonly isAddable: boolean;
}

class ChoiceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  readonly description: number;
  @IsString()
  @IsOptional()
  readonly imageUrl: string;
}
