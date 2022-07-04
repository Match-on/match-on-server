import { PartialType } from '@nestjs/mapped-types';
import { CreateUnivDto } from './create-univ.dto';

export class UpdateUnivDto extends PartialType(CreateUnivDto) {}
