import { Controller, Post, Body, Get, Param, Put, Delete, Query } from '@nestjs/common';
import { RdvDecisionsService } from '../services/rdv-decisions.service';
import { CreateDecisionDto } from '../dto/create-decision.dto';
import { RdvLifeStage } from '@prisma/client';

@Controller('rdv/decisions')
export class RdvDecisionsController {
  constructor(private readonly decisionsService: RdvDecisionsService) {}

  @Post()
  async create(@Body() dto: CreateDecisionDto) {
    return this.decisionsService.create(dto);
  }

  @Get()
  async findAll(@Query('stage') stage?: RdvLifeStage) {
    return this.decisionsService.findAll(stage);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.decisionsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<CreateDecisionDto>) {
    return this.decisionsService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.decisionsService.remove(id);
  }
}
