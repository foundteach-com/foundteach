import { IsString, IsOptional } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  subject!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  priority?: string; // LOW | MEDIUM | HIGH | CRITICAL

  @IsString()
  @IsOptional()
  reporter?: string;

  @IsString()
  @IsOptional()
  projectId?: string;

  @IsString()
  @IsOptional()
  customerId?: string;
}

export class UpdateTicketDto {
  @IsString()
  @IsOptional()
  subject?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  priority?: string;

  @IsString()
  @IsOptional()
  status?: string; // OPEN | IN_PROGRESS | RESOLVED | CLOSED

  @IsString()
  @IsOptional()
  assignee?: string;
}
