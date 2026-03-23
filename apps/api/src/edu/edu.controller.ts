import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EduService } from './edu.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { CreateLessonDto, UpdateLessonDto, CreateEnrollmentDto, UpdateEnrollmentDto, CreateAssessmentDto, UpdateAssessmentDto } from './dto/edu.dto';

@Controller('edu')
@UseGuards(AuthGuard('jwt'))
export class EduController {
  constructor(private edu: EduService) {}

  @Get('analytics') analytics() { return this.edu.getAnalytics(); }

  @Get('courses') getCourses(@Query('status') status?: string, @Query('category') category?: string) {
    return this.edu.findAllCourses(status, category);
  }
  @Get('courses/:id') getCourse(@Param('id') id: string) { return this.edu.findOneCourse(id); }
  @Post('courses') createCourse(@Body() dto: CreateCourseDto) { return this.edu.createCourse(dto); }
  @Put('courses/:id') updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto) { return this.edu.updateCourse(id, dto); }

  @Post('lessons') createLesson(@Body() dto: CreateLessonDto) { return this.edu.createLesson(dto); }
  @Put('lessons/:id') updateLesson(@Param('id') id: string, @Body() dto: UpdateLessonDto) { return this.edu.updateLesson(id, dto); }
  @Delete('lessons/:id') deleteLesson(@Param('id') id: string) { return this.edu.deleteLesson(id); }

  @Get('enrollments') getEnrollments(@Query('courseId') courseId?: string, @Query('status') status?: string) {
    return this.edu.findAllEnrollments(courseId, status);
  }
  @Post('enrollments') createEnrollment(@Body() dto: CreateEnrollmentDto) { return this.edu.createEnrollment(dto); }
  @Put('enrollments/:id') updateEnrollment(@Param('id') id: string, @Body() dto: UpdateEnrollmentDto) { return this.edu.updateEnrollment(id, dto); }

  @Get('assessments') getAssessments(@Query('courseId') courseId?: string) { return this.edu.findAllAssessments(courseId); }
  @Post('assessments') createAssessment(@Body() dto: CreateAssessmentDto) { return this.edu.createAssessment(dto); }
  @Put('assessments/:id') updateAssessment(@Param('id') id: string, @Body() dto: UpdateAssessmentDto) { return this.edu.updateAssessment(id, dto); }
}
