import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRepoDto, UpdateRepoDto } from './dto/repo.dto';
import { CreateDeploymentDto, UpdateDeploymentDto } from './dto/deployment.dto';
import { CreateBugDto, UpdateBugDto } from './dto/bug.dto';

@Injectable()
export class DevService {
  constructor(private prisma: PrismaService) {}

  // ─── Repositories ──────────────────────────────────────────────────────────

  findAllRepos() {
    return this.prisma.repository.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        project: { select: { id: true, title: true } },
        _count: { select: { deployments: true, bugs: true } },
      },
    });
  }

  async findOneRepo(id: string) {
    const repo = await this.prisma.repository.findUnique({
      where: { id },
      include: {
        deployments: { orderBy: { deployedAt: 'desc' }, take: 10 },
        bugs: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!repo) throw new NotFoundException('Repositorio no encontrado');
    return repo;
  }

  createRepo(dto: CreateRepoDto) {
    return this.prisma.repository.create({
      data: {
        name: dto.name,
        url: dto.url,
        language: dto.language,
        description: dto.description,
        defaultBranch: dto.defaultBranch ?? 'main',
        isActive: dto.isActive ?? true,
        projectId: dto.projectId ?? null,
      },
    });
  }

  async updateRepo(id: string, dto: UpdateRepoDto) {
    await this.findOneRepo(id);
    return this.prisma.repository.update({ where: { id }, data: dto });
  }

  // ─── GitHub Integration ────────────────────────────────────────────────────

  async getGitHubInfo(id: string) {
    const repo = await this.findOneRepo(id);
    if (!repo.url) throw new NotFoundException('Repositorio sin URL de GitHub');

    // Extraer owner/repo de URL (https://github.com/owner/repo)
    const match = repo.url.match(/github\.com\/([^/]+)\/([^/\s]+)/);
    if (!match) return { error: 'URL no es de GitHub', raw: null };

    const [, owner, repoName] = match;
    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const [repoRes, branchRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${owner}/${repoName}`, { headers }),
      fetch(`https://api.github.com/repos/${owner}/${repoName}/branches`, { headers }),
    ]);

    const repoData = repoRes.ok ? await repoRes.json() : null;
    const branches = branchRes.ok ? await branchRes.json() : [];

    return {
      name: repoData?.name,
      description: repoData?.description,
      language: repoData?.language,
      stars: repoData?.stargazers_count,
      forks: repoData?.forks_count,
      openIssues: repoData?.open_issues_count,
      defaultBranch: repoData?.default_branch,
      pushedAt: repoData?.pushed_at,
      branches: (branches as Array<{ name: string }>).map((b) => b.name),
    };
  }

  // ─── Deployments ───────────────────────────────────────────────────────────

  findAllDeployments(repoId?: string, environment?: string) {
    return this.prisma.deployment.findMany({
      where: {
        ...(repoId ? { repoId } : {}),
        ...(environment ? { environment } : {}),
      },
      orderBy: { deployedAt: 'desc' },
      include: { repository: { select: { id: true, name: true } } },
    });
  }

  createDeployment(dto: CreateDeploymentDto) {
    return this.prisma.deployment.create({
      data: {
        version: dto.version,
        environment: dto.environment ?? 'PROD',
        status: dto.status ?? 'IN_PROGRESS',
        notes: dto.notes,
        deployedBy: dto.deployedBy,
        deployedAt: dto.deployedAt ? new Date(dto.deployedAt) : new Date(),
        repoId: dto.repoId,
      },
    });
  }

  async updateDeployment(id: string, dto: UpdateDeploymentDto) {
    const d = await this.prisma.deployment.findUnique({ where: { id } });
    if (!d) throw new NotFoundException('Deployment no encontrado');
    return this.prisma.deployment.update({ where: { id }, data: dto });
  }

  // ─── Bugs ──────────────────────────────────────────────────────────────────

  findAllBugs(repoId?: string, severity?: string, status?: string) {
    return this.prisma.bug.findMany({
      where: {
        ...(repoId ? { repoId } : {}),
        ...(severity ? { severity } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        repository: { select: { id: true, name: true } },
        project: { select: { id: true, title: true } },
      },
    });
  }

  createBug(dto: CreateBugDto) {
    return this.prisma.bug.create({
      data: {
        title: dto.title,
        description: dto.description,
        severity: dto.severity ?? 'MEDIUM',
        status: dto.status ?? 'OPEN',
        assignee: dto.assignee,
        stepsToReproduce: dto.stepsToReproduce,
        labels: dto.labels,
        repoId: dto.repoId,
        projectId: dto.projectId ?? null,
      },
    });
  }

  async updateBug(id: string, dto: UpdateBugDto) {
    const bug = await this.prisma.bug.findUnique({ where: { id } });
    if (!bug) throw new NotFoundException('Bug no encontrado');
    return this.prisma.bug.update({ where: { id }, data: dto });
  }

  // ─── Stats ─────────────────────────────────────────────────────────────────

  async getStats() {
    const [repos, deployments, bugs] = await Promise.all([
      this.prisma.repository.count({ where: { isActive: true } }),
      this.prisma.deployment.groupBy({ by: ['status'], _count: true }),
      this.prisma.bug.groupBy({ by: ['severity', 'status'], _count: true }),
    ]);
    return { activeRepos: repos, deployments, bugs };
  }
}
