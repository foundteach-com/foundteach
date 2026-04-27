import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    
    this.openai = new OpenAI({
      apiKey: apiKey || 'missing_api_key',
    });
  }

  async getAdminContext(): Promise<string> {
    try {
      const [
        totalStudents,
        activeStudents,
        totalEmployees,
        totalCourses,
        totalCustomers,
        paidInvoicesAggr,
        unpaidInvoicesAggr
      ] = await Promise.all([
        prisma.user.count({ where: { role: 'STUDENT' } }),
        prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
        prisma.employee.count(),
        prisma.course.count(),
        prisma.customer.count(),
        prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 'PAID' } }),
        prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 'OVERDUE' } }),
      ]);

      const revenue = paidInvoicesAggr._sum.total || 0;
      const overdueAmount = unpaidInvoicesAggr._sum.total || 0;

      return `
Contexto Actual del Sistema FoundTeach:
- Total estudiantes: ${totalStudents}
- Estudiantes activos: ${activeStudents}
- Total empleados: ${totalEmployees}
- Total cursos en plataforma: ${totalCourses}
- Total clientes corporativos: ${totalCustomers}
- Ingresos totales (Facturas pagadas): ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(revenue)}
- Dinero pendiente (Facturas vencidas): ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(overdueAmount)}
      `.trim();
    } catch (error) {
      this.logger.error('Error fetching admin context', error);
      return 'Contexto no disponible por un error en la base de datos.';
    }
  }

  async askAI(question: string): Promise<string> {
    const context = await this.getAdminContext();

    const systemPrompt = `You are an administrative AI assistant for FOUNDTEACH. You analyze real platform data and provide accurate, concise, and useful answers for administrators in Spanish. Never invent data. Use the provided context to answer questions. If the question cannot be answered by the context, state so politely but try to be helpful based on your general knowledge of the platform.
    
Contexto proveído de la base de datos:
${context}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.';
    } catch (error: any) {
      this.logger.error('OpenAI Error', error);
      if (error?.status === 401) {
        throw new InternalServerErrorException('Error de autenticación con OpenAI. Verifica la API Key.');
      }
      throw new InternalServerErrorException('Error comunicándose con el servicio de IA');
    }
  }
}
