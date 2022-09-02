import { PartialType } from '@nestjs/mapped-types';
import { CreateDriveFolderDto } from './create-drive-folder.dto';

export class UpdateDriveFolderDto extends PartialType(CreateDriveFolderDto) {}
