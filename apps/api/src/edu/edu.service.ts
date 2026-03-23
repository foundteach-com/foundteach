import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import {
  CreateLessonDto, UpdateLessonDto,
  CreateEnrollmentDto, UpdateEnrollmentDto,
  CreateAssessmentDto, UpdateAssessmentDto,
} from './dto/edu.dto';

@Injectable()
export class EduService {
  constructor(private prisma: PrismaService) {}

  // ─── COURSES ──────────────────────────────────────────────────────────────

  findAllCourses(status?: string, category?: string) {
    return this.prisma.course.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { lessons: true, enrollments: true, assessments: true } },
      },
    });
  }

  async findOneCourse(id: string) {
    const c = await this.prisma.course.findUnique({
      where: { id },
      include: { lessons: { orderBy: { orderIndex: 'asc' } }, _count: { select: { enrollments: true } } },
    });
    if (!c) throw new NotFoundException('Curso no encontrado');
    return c;
  }

  createCourse(dto: CreateCourseDto) {
    return this.prisma.course.create({ data: dto as never });
  }

  async updateCourse(id: string, dto: UpdateCourseDto) {
    await this.findOneCourse(id);
    return this.prisma.course.update({ where: { id }, data: dto as never });
  }

  // ─── LESSONS ──────────────────────────────────────────────────────────────

  createLesson(dto: CreateLessonDto) {
    return this.prisma.lesson.create({ data: dto as never });
  }

  updateLesson(id: string, dto: UpdateLessonDto) {
    return this.prisma.lesson.update({ where: { id }, data: dto as never });
  }

  async deleteLesson(id: string) {
    await this.prisma.lesson.delete({ where: { id } });
    return { success: true };
  }

  // ─── ENROLLMENTS ──────────────────────────────────────────────────────────

  findAllEnrollments(courseId?: string, status?: string) {
    return this.prisma.enrollment.findMany({
      where: {
        ...(courseId ? { courseId } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: { course: { select: { id: true, title: true, level: true } } },
    });
  }

  createEnrollment(dto: CreateEnrollmentDto) {
    return this.prisma.enrollment.create({ data: dto as never });
  }

  async updateEnrollment(id: string, dto: UpdateEnrollmentDto) {
    const data: Record<string, unknown> = { ...dto };
    if (dto.progress === 100 && dto.status !== 'DROPPED') {
      data.status = 'COMPLETED';
      data.completedAt = new Date();
    }
    return this.prisma.enrollment.update({ where: { id }, data });
  }

  // ─── ASSESSMENTS ──────────────────────────────────────────────────────────

  findAllAssessments(courseId?: string) {
    return this.prisma.assessment.findMany({
      where: courseId ? { courseId } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        course: { select: { id: true, title: true } },
        enrollment: { select: { id: true, studentName: true } },
      },
    });
  }

  createAssessment(dto: CreateAssessmentDto) {
    return this.prisma.assessment.create({ data: dto as never });
  }

  updateAssessment(id: string, dto: UpdateAssessmentDto) {
    return this.prisma.assessment.update({ where: { id }, data: dto as never });
  }

  // ─── ANALYTICS ────────────────────────────────────────────────────────────

  async getAnalytics() {
    const [
      totalCourses, publishedCourses, totalEnrollments,
      completedEnrollments, avgProgressRaw, topCourses, recentEnrollments,
    ] = await Promise.all([
      this.prisma.course.count(),
      this.prisma.course.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.enrollment.count(),
      this.prisma.enrollment.count({ where: { status: 'COMPLETED' } }),
      this.prisma.enrollment.aggregate({ _avg: { progress: true } }),
      this.prisma.course.findMany({
        orderBy: { enrollments: { _count: 'desc' } },
        take: 5,
        include: { _count: { select: { enrollments: true } } },
      }),
      this.prisma.enrollment.findMany({
        orderBy: { createdAt: 'desc' }, take: 5,
        include: { course: { select: { title: true } } },
      }),
    ]);

    const completionRate = totalEnrollments > 0
      ? Math.round((completedEnrollments / totalEnrollments) * 100)
      : 0;

    return {
      totalCourses,
      publishedCourses,
      totalEnrollments,
      completedEnrollments,
      completionRate,
      avgProgress: Math.round(avgProgressRaw._avg.progress ?? 0),
      topCourses: topCourses.map(c => ({ id: c.id, title: c.title, students: c._count.enrollments })),
      recentEnrollments,
    };
  }
}
