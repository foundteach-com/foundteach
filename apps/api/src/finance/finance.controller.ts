import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { FinanceService } from './finance.service';
import type { CreateTransactionDto, CreateInvoiceDto } from './finance.service';

@Controller('finance')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.ADMIN)
export class FinanceController {
  constructor(private financeService: FinanceService) {}

  // ─── Transactions ──────────────────────────────────────────────────────────
  @Get('transactions')
  findAllTransactions(
    @Query('type') type?: string,
    @Query('category') category?: string,
  ) {
    return this.financeService.findAllTransactions(type, category);
  }

  @Post('transactions')
  createTransaction(@Body() dto: CreateTransactionDto) {
    return this.financeService.createTransaction(dto);
  }

  @Delete('transactions/:id')
  removeTransaction(@Param('id') id: string) {
    return this.financeService.removeTransaction(id);
  }

  // ─── Invoices ──────────────────────────────────────────────────────────────
  @Get('invoices')
  findAllInvoices(
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.financeService.findAllInvoices(type, status);
  }

  @Post('invoices')
  createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.financeService.createInvoice(dto);
  }

  @Patch('invoices/:id')
  updateInvoiceStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.financeService.updateInvoiceStatus(id, status);
  }

  // ─── Report ────────────────────────────────────────────────────────────────
  @Get('report')
  getReport() {
    return this.financeService.getReport();
  }
}
