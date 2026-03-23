import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { OpsService } from './ops.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { CreateTaskDto, UpdateTaskDto, CreateDeliverableDto, UpdateDeliverableDto } from './dto/task.dto';
import { CreateTicketDto, UpdateTicketDto } from './dto/ticket.dto';

const guard = [AuthGuard('jwt'), RolesGuard];

@Controller('ops')
@UseGuards(...guard)
@Roles(Role.ADMIN)
export class OpsController {
  constructor(private ops: OpsService) {}

  // Stats
  @Get('stats')
  stats() { return this.ops.getStats(); }

  // Projects
  @Get('projects')
  getProjects() { return this.ops.findAllProjects(); }

  @Get('projects/:id')
  getProject(@Param('id') id: string) { return this.ops.findOneProject(id); }

  @Post('projects')
  createProject(@Body() dto: CreateProjectDto) { return this.ops.createProject(dto); }

  @Put('projects/:id')
  updateProject(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.ops.updateProject(id, dto);
  }

  // Tasks
  @Get('tasks')
  getTasks(@Query('projectId') projectId?: string) {
    return projectId ? this.ops.findProjectTasks(projectId) : this.ops.findAllTasks();
  }

  @Post('tasks')
  createTask(@Body() dto: CreateTaskDto) { return this.ops.createTask(dto); }

  @Put('tasks/:id')
  updateTask(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.ops.updateTask(id, dto);
  }

  // Deliverables
  @Post('deliverables')
  createDeliverable(@Body() dto: CreateDeliverableDto) { return this.ops.createDeliverable(dto); }

  @Put('deliverables/:id')
  updateDeliverable(@Param('id') id: string, @Body() dto: UpdateDeliverableDto) {
    return this.ops.updateDeliverable(id, dto);
  }

  // Tickets
  @Get('tickets')
  getTickets(@Query('status') status?: string, @Query('priority') priority?: string) {
    return this.ops.findAllTickets(status, priority);
  }

  @Post('tickets')
  createTicket(@Body() dto: CreateTicketDto) { return this.ops.createTicket(dto); }

  @Put('tickets/:id')
  updateTicket(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.ops.updateTicket(id, dto);
  }
}
