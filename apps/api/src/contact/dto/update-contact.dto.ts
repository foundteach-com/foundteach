import { IsEnum, IsOptional } from 'class-validator';
import { ContactStatus } from '@prisma/client';

export class UpdateContactDto {
  @IsOptional()
  @IsEnum(ContactStatus)
  status?: ContactStatus;
}
