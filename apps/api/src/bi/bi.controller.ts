import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BiService } from './bi.service';

@Controller('bi')
@UseGuards(AuthGuard('jwt'))
export class BiController {
  constructor(private bi: BiService) {}

  @Get('metrics')  metrics()  { return this.bi.getMetrics(); }
  @Get('finance')  finance()  { return this.bi.getFinance(); }
  @Get('sales')    sales()    { return this.bi.getSales(); }
  @Get('ops')      ops()      { return this.bi.getOps(); }
  @Get('edu')      edu()      { return this.bi.getEdu(); }
  @Get('hcm')      hcm()      { return this.bi.getHcm(); }
  @Get('alerts')   alerts()   { return this.bi.getAlerts(); }
}
