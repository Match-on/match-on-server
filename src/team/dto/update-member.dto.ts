import { Optional } from '@nestjs/common';
import { IsString } from 'class-validator';

export class UpdateMemeberDto {
  @IsString()
  @Optional()
  readonly name: string;
  @IsString()
  @Optional()
  readonly detail: string;
  @IsString()
  @Optional()
  readonly status: string;
}
