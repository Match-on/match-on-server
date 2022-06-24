import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PickType(PartialType(CreateUserDto), [
  'nickname',
  'profileUrl',
  'countryCode',
  'phone',
  'birth',
  'emailAgree',
]) {}
