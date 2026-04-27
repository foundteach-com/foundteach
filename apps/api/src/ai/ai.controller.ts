import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body('message') message: string) {
    if (!message || message.trim() === '') {
      throw new BadRequestException('El mensaje no puede estar vacío');
    }
    
    const reply = await this.aiService.askAI(message);
    
    return {
      success: true,
      data: {
        reply,
      }
    };
  }
}
