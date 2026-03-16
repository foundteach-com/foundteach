import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { CreateJournalEntryDto } from './dto/journal.dto';

@Injectable()
export class FiService {
  constructor(private prisma: PrismaService) {}

  // --- Accounts ---
  async findAllAccounts() {
    return this.prisma.account.findMany({
      orderBy: { code: 'asc' },
    });
  }

  async createAccount(dto: CreateAccountDto) {
    return this.prisma.account.create({ data: dto });
  }

  async updateAccount(id: string, dto: UpdateAccountDto) {
    return this.prisma.account.update({
      where: { id },
      data: dto,
    });
  }

  // --- Journal Entries ---
  async findAllJournalEntries() {
    return this.prisma.journalEntry.findMany({
      include: {
        lines: {
          include: { account: true },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async createJournalEntry(dto: CreateJournalEntryDto) {
    // Validate that debits equal credits
    const debits = dto.lines.filter(l => l.type === 'DEBIT').reduce((acc, l) => acc + l.amount, 0);
    const credits = dto.lines.filter(l => l.type === 'CREDIT').reduce((acc, l) => acc + l.amount, 0);

    if (debits !== credits) {
      throw new BadRequestException('Los débitos y créditos deben ser iguales (Principio de partida doble)');
    }

    const entryNumber = `AS-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    return this.prisma.journalEntry.create({
      data: {
        entryNumber,
        date: new Date(dto.date),
        description: dto.description,
        status: dto.status || 'DRAFT',
        lines: {
          create: dto.lines.map(line => ({
            accountId: line.accountId,
            type: line.type,
            amount: line.amount,
            description: line.description,
          })),
        },
      },
      include: {
        lines: true,
      },
    });
  }

  // --- Stats ---
  async getFiStats() {
    const totalAccounts = await this.prisma.account.count({ where: { isActive: true } });
    
    // Simplificado para la demostración
    const journalEntriesObj = await this.prisma.journalEntry.count();
    
    // Obtener saldos de ingresos y gastos (aproximación rápida sumando asientos)
    const revenues = await this.prisma.journalEntryLine.aggregate({
      where: { account: { type: 'REVENUE' }, type: 'CREDIT' },
      _sum: { amount: true },
    });
    
    const expenses = await this.prisma.journalEntryLine.aggregate({
      where: { account: { type: 'EXPENSE' }, type: 'DEBIT' },
      _sum: { amount: true },
    });

    return {
      totalAccounts,
      totalEntries: journalEntriesObj,
      totalRevenue: Number(revenues._sum.amount || 0),
      totalExpense: Number(expenses._sum.amount || 0),
    };
  }
}
