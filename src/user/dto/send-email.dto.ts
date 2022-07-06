import { PickType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class SendEmailDto extends PickType(CreateUserDto, ['email']) {}
