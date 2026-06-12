import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP_ERROR');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log the error detailed info to terminal (Railway Logs)
    const errorLog = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      status,
      message,
      body: request.body,
      headers: request.headers,
    };

    // Remove sensitive data from log
    if (errorLog.body && typeof errorLog.body === 'object') {
      if ('password' in errorLog.body) (errorLog.body as any).password = '***';
    }
    if (errorLog.headers && 'authorization' in errorLog.headers) {
      errorLog.headers['authorization'] = '***';
    }

    this.logger.error(`[${request.method}] ${request.url} - Status: ${status}`);
    this.logger.error(JSON.stringify(errorLog, null, 2));

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'object' && message !== null && 'message' in message ? (message as any).message : message,
      error: typeof message === 'object' && message !== null && 'error' in message ? (message as any).error : undefined,
    });
  }
}
