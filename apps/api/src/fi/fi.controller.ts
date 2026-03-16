import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FiService } from './fi.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { CreateJournalEntryDto } from './dto/journal.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('api/fi')
export class FiController {
  constructor(private readonly fi: FiService) {}

  @Get('stats')
  getStats() {
    return this.fi.getFiStats();
  }

  // Accounts
  @Get('accounts')
  getAccounts() {
    return this.fi.findAllAccounts();
  }

  @Post('accounts')
  createAccount(@Body() dto: CreateAccountDto) {
    return this.fi.createAccount(dto);
  }

  @Put('accounts/:id')
  updateAccount(@Param('id') id: string, @Body() dto: UpdateAccountDto) {
    return this.fi.updateAccount(id, dto);
  }

  // Journal Entries
  @Get('journals')
  getJournals() {
    return this.fi.findAllJournalEntries();
  }

  @Post('journals')
  createJournal(@Body() dto: CreateJournalEntryDto) {
    return this.fi.createJournalEntry(dto);
  }
}
