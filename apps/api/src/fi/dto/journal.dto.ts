import { IsString, IsOptional, IsEnum, IsNumber, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EntryType, EntryStatus } from '@prisma/client';

export class JournalEntryLineDto {
  @IsString()
  accountId: string;

  @IsEnum(EntryType)
  type: EntryType;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateJournalEntryDto {
  @IsDateString()
  date: string;

  @IsString()
  description: string;

  @IsEnum(EntryStatus)
  @IsOptional()
  status?: EntryStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalEntryLineDto)
  lines: JournalEntryLineDto[];
}
