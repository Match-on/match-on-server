import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
enum Type {
  FREE = 'free',
  INFO = 'info',
  TEAM = 'team',
}
export class CreatePostDto {
  @IsNotEmpty()
  @IsEnum(Type)
  @MaxLength(10)
  readonly type: string;
  @IsString()
  @IsNotEmpty()
  readonly title: string;
  @IsString()
  @IsNotEmpty()
  readonly body: string;
  @IsBoolean()
  @IsOptional()
  readonly isAnonymous: boolean;
}
