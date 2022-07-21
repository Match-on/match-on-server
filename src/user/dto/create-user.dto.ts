import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNumber()
  @IsOptional()
  readonly univIdx: number;
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  readonly id: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i)
  readonly email: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
  readonly password: string;
  @IsString()
  @IsNotEmpty()
  readonly name: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(20)
  readonly nickname: string;
  @IsString()
  @IsOptional()
  @Matches(/(http(s)?:\/\/)([a-z0-9w]+.*)+[a-z0-9]{2,4}/i)
  readonly profileUrl: string;
  @IsString()
  @IsOptional()
  readonly countryCode: string;
  @IsString()
  @IsOptional()
  @Matches(/^\d{3}-\d{3,4}-\d{4}$/)
  readonly phone: string;
  @IsDateString()
  @IsOptional()
  @Matches(/^(19[0-9][0-9]|20\d{2})-(0[0-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/)
  readonly birth: Date;
  @IsBoolean()
  @IsNotEmpty()
  readonly emailAgree: boolean;
  @IsNumber()
  @IsOptional()
  // @Matches(/^(19[0-9][0-9]|20\d{2})$/)
  readonly enrolledAt: number;
}
