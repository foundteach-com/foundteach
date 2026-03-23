import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HcmService } from './hcm.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';
import { CreateContractDto, UpdateContractDto } from './dto/contract.dto';
import { CreatePayrollDto, UpdatePayrollDto } from './dto/payroll.dto';
import { CreateTimeEntryDto } from './dto/time-entry.dto';
import { CreateReviewDto, UpdateReviewDto, CreateSkillDto } from './dto/review.dto';

@UseGuards(AuthGuard('jwt'))
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

  // Time Entries
  @Get('time-entries')
  findTimeEntries(@Query('employeeId') employeeId?: string) {
    return this.hcm.findTimeEntries(employeeId);
  }

  @Post('time-entries')
  createTimeEntry(@Body() dto: CreateTimeEntryDto) { return this.hcm.createTimeEntry(dto); }

  @Delete('time-entries/:id')
  deleteTimeEntry(@Param('id') id: string) { return this.hcm.deleteTimeEntry(id); }

  // Skills
  @Get('employees/:id/skills')
  findSkills(@Param('id') id: string) { return this.hcm.findSkills(id); }

  @Post('skills')
  addSkill(@Body() dto: CreateSkillDto) { return this.hcm.addSkill(dto); }

  @Delete('skills/:id')
  deleteSkill(@Param('id') id: string) { return this.hcm.deleteSkill(id); }

  // Reviews
  @Get('reviews')
  findReviews(@Query('employeeId') employeeId?: string) {
    return this.hcm.findReviews(employeeId);
  }

  @Post('reviews')
  createReview(@Body() dto: CreateReviewDto) { return this.hcm.createReview(dto); }

  @Put('reviews/:id')
  updateReview(@Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.hcm.updateReview(id, dto);
  }
}
