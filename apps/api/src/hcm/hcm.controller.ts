import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards
} from '@nestjs/common';
import { HcmService } from './hcm.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import { CreateContractDto, UpdateContractDto } from './dto/contract.dto';
import { CreatePayrollDto, UpdatePayrollDto } from './dto/payroll.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/hcm')
export class HcmController {
  constructor(private readonly hcm: HcmService) {}

  // Stats
  @Get('stats')
  getStats() { return this.hcm.getHcmStats(); }

  // Employees
  @Get('employees')
  findEmployees(@Query('onlyActive') onlyActive?: string) {
    return this.hcm.findAllEmployees(onlyActive === 'true');
  }

  @Get('employees/:id')
  findEmployee(@Param('id') id: string) { return this.hcm.findOneEmployee(id); }

  @Post('employees')
  createEmployee(@Body() dto: CreateEmployeeDto) { return this.hcm.createEmployee(dto); }

  @Put('employees/:id')
  updateEmployee(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.hcm.updateEmployee(id, dto);
  }

  @Delete('employees/:id')
  deleteEmployee(@Param('id') id: string) { return this.hcm.deleteEmployee(id); }

  // Contracts
  @Get('contracts')
  findContracts(@Query('employeeId') employeeId?: string) {
    return this.hcm.findAllContracts(employeeId);
  }

  @Post('contracts')
  createContract(@Body() dto: CreateContractDto) { return this.hcm.createContract(dto); }

  @Put('contracts/:id')
  updateContract(@Param('id') id: string, @Body() dto: UpdateContractDto) {
    return this.hcm.updateContract(id, dto);
  }

  @Delete('contracts/:id')
  deleteContract(@Param('id') id: string) { return this.hcm.deleteContract(id); }

  // Payroll
  @Get('payrolls')
  findPayrolls(@Query('employeeId') employeeId?: string) {
    return this.hcm.findAllPayrolls(employeeId);
  }

  @Post('payrolls')
  createPayroll(@Body() dto: CreatePayrollDto) { return this.hcm.createPayroll(dto); }

  @Put('payrolls/:id')
  updatePayroll(@Param('id') id: string, @Body() dto: UpdatePayrollDto) {
    return this.hcm.updatePayroll(id, dto);
  }
}
