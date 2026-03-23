import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BiService {
  constructor(private prisma: PrismaService) {}

  // ─── GLOBAL KPIs ──────────────────────────────────────────────────────────
  async getMetrics() {
    const [
      totalClients, totalProjects, openTickets,
      totalEmployees, publishedCourses, totalEnrollments,
      pendingInvoices, paidInvoicesThisMonth,
    ] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.project.count({ where: { status: { not: 'DONE' } } }),
      this.prisma.ticket.count({ where: { status: { not: 'CLOSED' } } }),
      this.prisma.employee.count({ where: { isActive: true } }),
      this.prisma.course.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.enrollment.count(),
      this.prisma.invoice.count({ where: { status: 'PENDING' } }),
      this.prisma.invoice.aggregate({
        where: {
          status: 'PAID',
          issueDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
        _sum: { total: true },
      }),
    ]);

    return {
      totalClients,
      totalProjects,
      openTickets,
      totalEmployees,
      publishedCourses,
      totalEnrollments,
      pendingInvoices,
      revenueThisMonth: paidInvoicesThisMonth._sum.total ?? 0,
    };
  }

  // ─── FINANZAS ─────────────────────────────────────────────────────────────
  async getFinance() {
    const months: { month: string; revenue: number; expenses: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const [rev, exp] = await Promise.all([
        this.prisma.invoice.aggregate({
          where: { status: 'PAID', issueDate: { gte: start, lte: end } },
          _sum: { total: true },
        }),
        this.prisma.transaction.aggregate({
          where: { type: 'EXPENSE', date: { gte: start, lte: end } },
          _sum: { amount: true },
        }),
      ]);

      months.push({
        month: d.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' }),
        revenue: Number(rev._sum.total ?? 0),
        expenses: Number(exp._sum.amount ?? 0),
      });
    }

    const totalRevenue = months.reduce((s, m) => s + m.revenue, 0);
    const totalExpenses = months.reduce((s, m) => s + m.expenses, 0);
    const margin = totalRevenue > 0 ? Math.round(((totalRevenue - totalExpenses) / totalRevenue) * 100) : 0;

    return { months, totalRevenue, totalExpenses, margin };
  }

  // ─── VENTAS / CRM ─────────────────────────────────────────────────────────
  async getSales() {
    const [
      totalClients, activeClients, totalQuotes, acceptedQuotes,
      pendingInvoices, paidInvoices, totalInvoiceAmount,
      pipelineData,
    ] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.customer.count({ where: { status: 'ACTIVE' } }),
      this.prisma.quote.count(),
      this.prisma.quote.count({ where: { status: 'ACCEPTED' } }),
      this.prisma.invoice.count({ where: { status: 'PENDING' } }),
      this.prisma.invoice.count({ where: { status: 'PAID' } }),
      this.prisma.invoice.aggregate({ where: { status: 'PAID' }, _sum: { total: true } }),
      this.prisma.customer.groupBy({ by: ['pipelineStage'], _count: { id: true } }),
    ]);

    return {
      totalClients, activeClients,
      totalQuotes, acceptedQuotes,
      conversionRate: totalQuotes > 0 ? Math.round((acceptedQuotes / totalQuotes) * 100) : 0,
      pendingInvoices, paidInvoices,
      totalRevenue: Number(totalInvoiceAmount._sum.total ?? 0),
      pipeline: pipelineData.map(p => ({ stage: p.pipelineStage, count: p._count.id })),
    };
  }

  // ─── OPERACIONES ──────────────────────────────────────────────────────────
  async getOps() {
    const [
      totalProjects, activeProjects, completedProjects,
      totalTasks, doneTasks, openTickets, criticalTickets,
      totalRepos, activeDeployments,
    ] = await Promise.all([
      this.prisma.project.count(),
      this.prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.project.count({ where: { status: 'DONE' } }),
      this.prisma.task.count(),
      this.prisma.task.count({ where: { status: 'DONE' } }),
      this.prisma.ticket.count({ where: { status: { not: 'CLOSED' } } }),
      this.prisma.ticket.count({ where: { severity: 'CRITICAL', status: { not: 'CLOSED' } } }),
      this.prisma.repo.count(),
      this.prisma.deployment.count({ where: { status: 'SUCCESS' } }),
    ]);

    return {
      totalProjects, activeProjects, completedProjects,
      totalTasks, doneTasks,
      taskVelocity: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
      openTickets, criticalTickets,
      totalRepos, activeDeployments,
    };
  }

  // ─── EDUCACIÓN ────────────────────────────────────────────────────────────
  async getEdu() {
    const [
      totalCourses, publishedCourses, totalEnrollments,
      completedEnrollments, avgProgressRaw, totalAssessments,
      scoredAssessments,
    ] = await Promise.all([
      this.prisma.course.count(),
      this.prisma.course.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.enrollment.count(),
      this.prisma.enrollment.count({ where: { status: 'COMPLETED' } }),
      this.prisma.enrollment.aggregate({ _avg: { progress: true } }),
      this.prisma.assessment.count(),
      this.prisma.assessment.aggregate({
        where: { score: { not: null } },
        _avg: { score: true },
        _count: { id: true },
      }),
    ]);

    return {
      totalCourses, publishedCourses,
      totalEnrollments, completedEnrollments,
      completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
      avgProgress: Math.round(avgProgressRaw._avg.progress ?? 0),
      totalAssessments,
      scoredAssessments: scoredAssessments._count.id,
      avgAssessmentScore: Math.round(Number(scoredAssessments._avg.score ?? 0)),
    };
  }

  // ─── TALENTO HUMANO ───────────────────────────────────────────────────────
  async getHcm() {
    const [
      totalEmployees, activeEmployees,
      pendingPayroll, paidPayroll,
      pendingAmount, paidAmount,
      openReviews,
    ] = await Promise.all([
      this.prisma.employee.count(),
      this.prisma.employee.count({ where: { isActive: true } }),
      this.prisma.payroll.count({ where: { status: 'PENDING' } }),
      this.prisma.payroll.count({ where: { status: 'PAID' } }),
      this.prisma.payroll.aggregate({ where: { status: 'PENDING' }, _sum: { netPay: true } }),
      this.prisma.payroll.aggregate({ where: { status: 'PAID' }, _sum: { netPay: true } }),
      this.prisma.performanceReview.count({ where: { status: { not: 'ACKNOWLEDGED' } } }),
    ]);

    return {
      totalEmployees, activeEmployees,
      pendingPayroll, paidPayroll,
      pendingAmount: Number(pendingAmount._sum.netPay ?? 0),
      paidAmount: Number(paidAmount._sum.netPay ?? 0),
      openReviews,
    };
  }

  // ─── ALERTAS INTELIGENTES ─────────────────────────────────────────────────
  async getAlerts() {
    const alerts: { type: string; severity: string; message: string; count?: number }[] = [];

    const [criticalTickets, pendingPayroll, openReviews, overdueInvoices, droppedEnrollments] =
      await Promise.all([
        this.prisma.ticket.count({ where: { severity: 'CRITICAL', status: { not: 'CLOSED' } } }),
        this.prisma.payroll.count({ where: { status: 'PENDING' } }),
        this.prisma.performanceReview.count({ where: { status: 'DRAFT' } }),
        this.prisma.invoice.count({ where: { status: 'PENDING', dueDate: { lt: new Date() } } }),
        this.prisma.enrollment.count({ where: { status: 'DROPPED' } }),
      ]);

    if (criticalTickets > 0) alerts.push({ type: 'dev', severity: 'critical', message: 'Tickets críticos sin resolver', count: criticalTickets });
    if (pendingPayroll > 0) alerts.push({ type: 'hcm', severity: 'warning', message: 'Pagos de nómina pendientes', count: pendingPayroll });
    if (openReviews > 0) alerts.push({ type: 'hcm', severity: 'info', message: 'Evaluaciones de desempeño en borrador', count: openReviews });
    if (overdueInvoices > 0) alerts.push({ type: 'finance', severity: 'critical', message: 'Facturas vencidas sin cobrar', count: overdueInvoices });
    if (droppedEnrollments > 0) alerts.push({ type: 'edu', severity: 'warning', message: 'Estudiantes han abandonado cursos', count: droppedEnrollments });
    if (alerts.length === 0) alerts.push({ type: 'system', severity: 'success', message: '¡Todo en orden! Sin alertas activas.' });

    return alerts;
  }
}
