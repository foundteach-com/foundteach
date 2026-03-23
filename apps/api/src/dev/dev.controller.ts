import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { DevService } from './dev.service';
import { CreateRepoDto, UpdateRepoDto } from './dto/repo.dto';
import { CreateDeploymentDto, UpdateDeploymentDto } from './dto/deployment.dto';
import { CreateBugDto, UpdateBugDto } from './dto/bug.dto';

const guard = [AuthGuard('jwt'), RolesGuard];

@Controller('dev')
@UseGuards(...guard)
@Roles(Role.ADMIN)
export class DevController {
  constructor(private dev: DevService) {}

  // Stats
  @Get('stats')
  stats() { return this.dev.getStats(); }

  // Repos
  @Get('repos')
  getRepos() { return this.dev.findAllRepos(); }

  @Get('repos/:id')
  getRepo(@Param('id') id: string) { return this.dev.findOneRepo(id); }

  @Get('repos/:id/github')
  getGitHub(@Param('id') id: string) { return this.dev.getGitHubInfo(id); }

  @Post('repos')
  createRepo(@Body() dto: CreateRepoDto) { return this.dev.createRepo(dto); }

  @Put('repos/:id')
  updateRepo(@Param('id') id: string, @Body() dto: UpdateRepoDto) {
    return this.dev.updateRepo(id, dto);
  }

  // Deployments
  @Get('deployments')
  getDeployments(
    @Query('repoId') repoId?: string,
    @Query('environment') environment?: string,
  ) { return this.dev.findAllDeployments(repoId, environment); }

  @Post('deployments')
  createDeployment(@Body() dto: CreateDeploymentDto) { return this.dev.createDeployment(dto); }

  @Put('deployments/:id')
  updateDeployment(@Param('id') id: string, @Body() dto: UpdateDeploymentDto) {
    return this.dev.updateDeployment(id, dto);
  }

  // Bugs
  @Get('bugs')
  getBugs(
    @Query('repoId') repoId?: string,
    @Query('severity') severity?: string,
    @Query('status') status?: string,
  ) { return this.dev.findAllBugs(repoId, severity, status); }

  @Post('bugs')
  createBug(@Body() dto: CreateBugDto) { return this.dev.createBug(dto); }

  @Put('bugs/:id')
  updateBug(@Param('id') id: string, @Body() dto: UpdateBugDto) {
    return this.dev.updateBug(id, dto);
  }
}
