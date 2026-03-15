import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SdService } from './sd.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { CreateQuoteDto } from './dto/quote.dto';
import { CreateDealDto, UpdateDealDto } from './dto/deal.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('api/sd')
export class SdController {
  constructor(private readonly sd: SdService) {}

  @Get('stats')
  getStats() {
    return this.sd.getSdStats();
  }

  // Customers
  @Get('customers')
  getCustomers() {
    return this.sd.findAllCustomers();
  }

  @Get('customers/:id')
  getCustomer(@Param('id') id: string) {
    return this.sd.findOneCustomer(id);
  }

  @Post('customers')
  createCustomer(@Body() dto: CreateCustomerDto) {
    return this.sd.createCustomer(dto);
  }

  @Put('customers/:id')
  updateCustomer(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.sd.updateCustomer(id, dto);
  }

  // Products
  @Get('products')
  getProducts() {
    return this.sd.findAllProducts();
  }

  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.sd.createProduct(dto);
  }

  @Put('products/:id')
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.sd.updateProduct(id, dto);
  }

  // Quotes
  @Get('quotes')
  getQuotes() {
    return this.sd.findAllQuotes();
  }

  @Post('quotes')
  createQuote(@Body() dto: CreateQuoteDto) {
    return this.sd.createQuote(dto);
  }

  // Deals
  @Get('deals')
  getDeals() {
    return this.sd.findAllDeals();
  }

  @Post('deals')
  createDeal(@Body() dto: CreateDealDto) {
    return this.sd.createDeal(dto);
  }

  @Put('deals/:id')
  updateDeal(@Param('id') id: string, @Body() dto: UpdateDealDto) {
    return this.sd.updateDeal(id, dto);
  }
}
