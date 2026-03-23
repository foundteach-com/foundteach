import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateTransactionDto {
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  category: string;
  date: string;
  reference?: string;
  notes?: string;
}

export interface CreateInvoiceDto {
  number: string;
  type: 'RECEIVABLE' | 'PAYABLE';
  party: string;
  amount: number;
  tax?: number;
  issueDate: string;
  dueDate: string;
  description?: string;
}

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  // ─── Transactions ──────────────────────────────────────────────────────────

  findAllTransactions(type?: string, category?: string) {
    return this.prisma.transaction.findMany({
      where: {
        ...(type ? { type } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { date: 'desc' },
    });
  }

  createTransaction(dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: {
        type: dto.type,
        amount: Number(dto.amount),
        description: dto.description,
        category: dto.category,
        date: new Date(dto.date),
        reference: dto.reference,
        notes: dto.notes,
      },
    });
  }

  async removeTransaction(id: string) {
    const tx = await this.prisma.transaction.findUnique({ where: { id } });
    if (!tx) throw new NotFoundException('Transacción no encontrada');
    return this.prisma.transaction.delete({ where: { id } });
  }

  // ─── Invoices ──────────────────────────────────────────────────────────────

  findAllInvoices(type?: string, status?: string) {
    return this.prisma.billing.findMany({
      where: {
        ...(type ? { type } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  createInvoice(dto: CreateInvoiceDto) {
    return this.prisma.billing.create({
      data: {
        number: dto.number,
        type: dto.type,
        party: dto.party,
        amount: Number(dto.amount),
        tax: Number(dto.tax ?? 0),
        issueDate: new Date(dto.issueDate),
        dueDate: new Date(dto.dueDate),
        description: dto.description,
      },
    });
  }

  async updateInvoiceStatus(id: string, status: string) {
    const inv = await this.prisma.billing.findUnique({ where: { id } });
    if (!inv) throw new NotFoundException('Factura no encontrada');
    return this.prisma.billing.update({ where: { id }, data: { status } });
  }

  // ─── Report ────────────────────────────────────────────────────────────────

  async getReport() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [allTx, monthTx, invoices] = await Promise.all([
      this.prisma.transaction.findMany({ orderBy: { date: 'asc' } }),
      this.prisma.transaction.findMany({ where: { date: { gte: startOfMonth } } }),
      this.prisma.billing.findMany(),
    ]);

    const totalIncome = allTx.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const totalExpense = allTx.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
    const monthIncome = monthTx.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
    const monthExpense = monthTx.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

    // Receivable/payable pending totals
    const pendingReceivable = invoices
      .filter(i => i.type === 'RECEIVABLE' && i.status === 'PENDING')
      .reduce((s, i) => s + i.amount + i.tax, 0);
    const pendingPayable = invoices
      .filter(i => i.type === 'PAYABLE' && i.status === 'PENDING')
      .reduce((s, i) => s + i.amount + i.tax, 0);

    // Last 6 months cash flow
    const months: { label: string; income: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const label = d.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' });
      const mTx = allTx.filter(t => t.date >= d && t.date <= end);
      months.push({
        label,
        income: mTx.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0),
        expense: mTx.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0),
      });
    }

    // Category breakdown (expenses)
    const categoryMap: Record<string, number> = {};
    allTx.filter(t => t.type === 'EXPENSE').forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] ?? 0) + t.amount;
    });

    return {
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      monthIncome,
      monthExpense,
      monthNet: monthIncome - monthExpense,
      pendingReceivable,
      pendingPayable,
      cashflow: months,
      expenseByCategory: Object.entries(categoryMap)
        .map(([cat, amount]) => ({ category: cat, amount }))
        .sort((a, b) => b.amount - a.amount),
    };
  }
}
