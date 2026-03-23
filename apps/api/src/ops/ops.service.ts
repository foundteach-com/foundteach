import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { CreateTaskDto, UpdateTaskDto, CreateDeliverableDto, UpdateDeliverableDto } from './dto/task.dto';
import { CreateTicketDto, UpdateTicketDto } from './dto/ticket.dto';

@Injectable()
export class OpsService {
  constructor(private prisma: PrismaService) {}

  // ─── Projects ──────────────────────────────────────────────────────────────

  findAllProjects() {
    return this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, name: true } },
        _count: { select: { tasks: true, deliverables: true, tickets: true } },
      },
    });
  }

  async findOneProject(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        customer: true,
        tasks: { orderBy: { createdAt: 'asc' } },
        deliverables: { orderBy: { createdAt: 'asc' } },
        tickets: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!project) throw new NotFoundException('Proyecto no encontrado');
    return project;
  }

  createProject(dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status ?? 'PLANNING',
        progress: dto.progress ?? 0,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        budget: dto.budget ? Number(dto.budget) : null,
        responsible: dto.responsible,
        color: dto.color,
        customerId: dto.customerId ?? null,
      },
    });
  }

  async updateProject(id: string, dto: UpdateProjectDto) {
    await this.findOneProject(id);
    return this.prisma.project.update({
      where: { id },
      data: {
        ...dto,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  // ─── Tasks ─────────────────────────────────────────────────────────────────

  findProjectTasks(projectId: string) {
    return this.prisma.projectTask.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  }

  findAllTasks() {
    return this.prisma.projectTask.findMany({
      orderBy: { createdAt: 'desc' },
      include: { project: { select: { id: true, title: true, color: true } } },
    });
  }

  createTask(dto: CreateTaskDto) {
    return this.prisma.projectTask.create({
      data: {
        title: dto.title,
        description: dto.description,
        projectId: dto.projectId,
        status: dto.status ?? 'TODO',
        priority: dto.priority ?? 'MEDIUM',
        assignee: dto.assignee,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });
  }

  async updateTask(id: string, dto: UpdateTaskDto) {
    const task = await this.prisma.projectTask.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Tarea no encontrada');
    return this.prisma.projectTask.update({
      where: { id },
      data: {
        ...dto,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  // ─── Deliverables ──────────────────────────────────────────────────────────

  createDeliverable(dto: CreateDeliverableDto) {
    return this.prisma.deliverable.create({
      data: {
        name: dto.name,
        description: dto.description,
        projectId: dto.projectId,
        status: dto.status ?? 'PENDING',
        fileUrl: dto.fileUrl,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });
  }

  async updateDeliverable(id: string, dto: UpdateDeliverableDto) {
    const d = await this.prisma.deliverable.findUnique({ where: { id } });
    if (!d) throw new NotFoundException('Entregable no encontrado');
    return this.prisma.deliverable.update({ where: { id }, data: dto });
  }

  // ─── Tickets ───────────────────────────────────────────────────────────────

  findAllTickets(status?: string, priority?: string) {
    return this.prisma.supportTicket.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { id: true, title: true } },
        customer: { select: { id: true, name: true } },
      },
    });
  }

  createTicket(dto: CreateTicketDto) {
    return this.prisma.supportTicket.create({
      data: {
        subject: dto.subject,
        description: dto.description,
        priority: dto.priority ?? 'MEDIUM',
        reporter: dto.reporter,
        projectId: dto.projectId ?? null,
        customerId: dto.customerId ?? null,
      },
    });
  }

  async updateTicket(id: string, dto: UpdateTicketDto) {
    const t = await this.prisma.supportTicket.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Ticket no encontrado');
    return this.prisma.supportTicket.update({ where: { id }, data: dto });
  }

  // ─── Stats ─────────────────────────────────────────────────────────────────

  async getStats() {
    const [projects, tasks, tickets] = await Promise.all([
      this.prisma.project.groupBy({ by: ['status'], _count: true }),
      this.prisma.projectTask.groupBy({ by: ['status'], _count: true }),
      this.prisma.supportTicket.groupBy({ by: ['status'], _count: true }),
    ]);
    return { projects, tasks, tickets };
  }
}
