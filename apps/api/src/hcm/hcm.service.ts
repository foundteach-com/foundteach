import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import { CreateContractDto, UpdateContractDto } from './dto/contract.dto';
import { CreatePayrollDto, UpdatePayrollDto } from './dto/payroll.dto';
import { CreateTimeEntryDto } from './dto/time-entry.dto';
import { CreateReviewDto, UpdateReviewDto, CreateSkillDto } from './dto/review.dto';

@Injectable()
export class HcmService {
  constructor(private prisma: PrismaService) {}

  // ─── EMPLOYEES ────────────────────────────────────────────────────────────

  async findAllEmployees(onlyActive?: boolean) {
    return this.prisma.employee.findMany({
      where: onlyActive ? { isActive: true } : {},
      include: {
        contracts: { where: { status: 'ACTIVE' }, take: 1 },
        _count: { select: { payrolls: true, timeEntries: true, skills: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneEmployee(id: string) {
    const emp = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        contracts: true,
        payrolls: { orderBy: { period: 'desc' } },
        skills: true,
        reviews: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!emp) throw new NotFoundException('Empleado no encontrado');
    return emp;
  }

  async createEmployee(dto: CreateEmployeeDto) {
    return this.prisma.employee.create({ data: dto as never });
  }

  async updateEmployee(id: string, dto: UpdateEmployeeDto) {
    await this.findOneEmployee(id);
    return this.prisma.employee.update({ where: { id }, data: dto as never });
  }

  async deleteEmployee(id: string) {
    await this.findOneEmployee(id);
    await this.prisma.employee.delete({ where: { id } });
    return { success: true, message: 'Colaborador eliminado' };
  }

  // ─── CONTRACTS ────────────────────────────────────────────────────────────

  async findAllContracts(employeeId?: string) {
    return this.prisma.contract.findMany({
      where: employeeId ? { employeeId } : {},
      include: { employee: { select: { firstName: true, lastName: true, position: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createContract(dto: CreateContractDto) {
    return this.prisma.contract.create({ data: dto as never });
  }

  async updateContract(id: string, dto: UpdateContractDto) {
    return this.prisma.contract.update({ where: { id }, data: dto as never });
  }

  async deleteContract(id: string) {
    await this.prisma.contract.delete({ where: { id } });
    return { success: true };
  }

  // ─── PAYROLL ──────────────────────────────────────────────────────────────

  async findAllPayrolls(employeeId?: string) {
    return this.prisma.payroll.findMany({
      where: employeeId ? { employeeId } : {},
      include: { employee: { select: { firstName: true, lastName: true, position: true } } },
      orderBy: { period: 'desc' },
    });
  }

  async createPayroll(dto: CreatePayrollDto) {
    return this.prisma.payroll.create({ data: dto as never });
  }

  async updatePayroll(id: string, dto: UpdatePayrollDto) {
    return this.prisma.payroll.update({ where: { id }, data: dto as never });
  }

  // ─── TIME ENTRIES ─────────────────────────────────────────────────────────

  async findTimeEntries(employeeId?: string) {
    return this.prisma.timeEntry.findMany({
      where: employeeId ? { employeeId } : {},
      orderBy: { date: 'desc' },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        project: { select: { id: true, title: true } },
      },
    });
  }

  async createTimeEntry(dto: CreateTimeEntryDto) {
    return this.prisma.timeEntry.create({
      data: {
        employeeId: dto.employeeId,
        date: new Date(dto.date),
        hours: dto.hours,
        description: dto.description,
        projectId: dto.projectId ?? null,
      },
    });
  }

  async deleteTimeEntry(id: string) {
    await this.prisma.timeEntry.delete({ where: { id } });
    return { success: true };
  }

  // ─── SKILLS ───────────────────────────────────────────────────────────────

  async findSkills(employeeId: string) {
    return this.prisma.employeeSkill.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addSkill(dto: CreateSkillDto) {
    return this.prisma.employeeSkill.create({ data: dto as never });
  }

  async deleteSkill(id: string) {
    await this.prisma.employeeSkill.delete({ where: { id } });
    return { success: true };
  }

  // ─── REVIEWS ──────────────────────────────────────────────────────────────

  async findReviews(employeeId?: string) {
    return this.prisma.performanceReview.findMany({
      where: employeeId ? { employeeId } : {},
      orderBy: { createdAt: 'desc' },
      include: { employee: { select: { id: true, firstName: true, lastName: true, position: true } } },
    });
  }

  async createReview(dto: CreateReviewDto) {
    return this.prisma.performanceReview.create({ data: dto as never });
  }

  async updateReview(id: string, dto: UpdateReviewDto) {
    return this.prisma.performanceReview.update({ where: { id }, data: dto as never });
  }

  // ─── STATS ────────────────────────────────────────────────────────────────

  async getHcmStats() {
    const [totalEmployees, activeEmployees, totalContracts, pendingPayrolls] = await Promise.all([
      this.prisma.employee.count(),
      this.prisma.employee.count({ where: { isActive: true } }),
      this.prisma.contract.count({ where: { status: 'ACTIVE' } }),
      this.prisma.payroll.count({ where: { status: 'PENDING' } }),
    ]);
    return { totalEmployees, activeEmployees, totalContracts, pendingPayrolls };
  }
}
