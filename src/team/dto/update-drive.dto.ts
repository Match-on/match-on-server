import { PartialType } from '@nestjs/mapped-types';
import { CreateDriveDto } from './create-drive.dto';

export class UpdateDriveDto extends PartialType(CreateDriveDto) {}
