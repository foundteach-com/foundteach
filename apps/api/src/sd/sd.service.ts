import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { CreateQuoteDto } from './dto/quote.dto';
import { CreateDealDto, UpdateDealDto } from './dto/deal.dto';

@Injectable()
export class SdService {
  constructor(private prisma: PrismaService) {}

  // --- Customers ---
  async findAllCustomers() {
    return this.prisma.customer.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOneCustomer(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        quotes: true,
        invoices: true,
        deals: true,
      },
    });
    if (!customer) throw new NotFoundException('Cliente no encontrado');
    return customer;
  }

  async createCustomer(dto: CreateCustomerDto) {
    return this.prisma.customer.create({ data: dto });
  }

  async updateCustomer(id: string, dto: UpdateCustomerDto) {
    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  // --- Products ---
  async findAllProducts() {
    return this.prisma.product.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createProduct(dto: CreateProductDto) {
    return this.prisma.product.create({ data: dto });
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  // --- Quotes ---
  async findAllQuotes() {
    return this.prisma.quote.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createQuote(dto: CreateQuoteDto) {
    const { items, ...quoteData } = dto;
    
    // Cálculo de totales (simplificado)
    let subtotal = 0;
    const itemsToCreate = items.map(item => {
      const itemTotal = item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100);
      subtotal += itemTotal;
      return {
        ...item,
        total: itemTotal,
      };
    });

    const taxPercent = 19; // IVA estándar Colombia
    const taxAmount = subtotal * (taxPercent / 100);
    const total = subtotal + taxAmount;

    return this.prisma.quote.create({
      data: {
        ...quoteData,
        subtotal,
        taxPercent,
        taxAmount,
        total,
        items: {
          create: itemsToCreate,
        },
      },
      include: { items: true },
    });
  }

  // --- Deals (Pipeline) ---
  async findAllDeals() {
    return this.prisma.deal.findMany({
      include: { customer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDeal(dto: CreateDealDto) {
    return this.prisma.deal.create({ data: dto });
  }

  async updateDeal(id: string, dto: UpdateDealDto) {
    return this.prisma.deal.update({
      where: { id },
      data: dto,
    });
  }

  // --- Stats ---
  async getSdStats() {
    const [customerCount, quoteCount, dealCount, totalSalesObj] = await Promise.all([
      this.prisma.customer.count({ where: { isActive: true } }),
      this.prisma.quote.count(),
      this.prisma.deal.count({ where: { stage: { notIn: ['CLOSED_WON', 'CLOSED_LOST'] } } }),
      this.prisma.invoice.aggregate({
        where: { status: 'PAID' },
        _sum: { total: true },
      }),
    ]);

    return {
      activeCustomers: customerCount,
      totalQuotes: quoteCount,
      activeDeals: dealCount,
      totalRevenue: totalSalesObj._sum.total || 0,
    };
  }
}
