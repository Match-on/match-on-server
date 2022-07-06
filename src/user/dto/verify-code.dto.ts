import { IsNotEmpty, IsNumberString, Length } from 'class-validator';
import { SendEmailDto } from './send-email.dto';

export class VerifyCodeDto extends SendEmailDto {
  @IsNumberString()
  @IsNotEmpty()
  @Length(6)
  readonly code: string;
}
