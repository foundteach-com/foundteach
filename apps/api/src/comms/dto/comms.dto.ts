import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateNotificationDto {
  @IsString() title!: string;
  @IsString() message!: string;
  @IsString() @IsOptional() type?: string;
  @IsString() @IsOptional() module?: string;
  @IsString() @IsOptional() linkUrl?: string;
}

export class CreateMessageDto {
  @IsString() fromName!: string;
  @IsString() @IsOptional() fromEmail?: string;
  @IsString() toName!: string;
  @IsString() @IsOptional() toEmail?: string;
  @IsString() subject!: string;
  @IsString() body!: string;
  @IsString() @IsOptional() replyToId?: string;
}

export class UpdateMessageDto {
  @IsBoolean() @IsOptional() isRead?: boolean;
}
