import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Unified error response shape:
 *   { statusCode, code, message, details? }
 *
 * Where `code` is a machine-readable identifier (PRODUCT_NOT_FOUND, EMAIL_TAKEN,
 * VALIDATION_FAILED, …). Frontend translates these codes to user strings.
 *
 * If a thrown exception already has `code` in its response, we forward it.
 * Otherwise we infer one from the HTTP status (404 → NOT_FOUND, 401 → UNAUTHORIZED…).
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Internal server error';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        const r = response as Record<string, unknown>;
        if (typeof r.code === 'string') code = r.code;
        else code = inferCode(statusCode);

        if (typeof r.message === 'string') {
          message = r.message;
        } else if (Array.isArray(r.message)) {
          // class-validator returns string[]
          message = r.message.join('; ');
          details = r.message;
        }
        if (r.details !== undefined) details = r.details;
      } else {
        code = inferCode(statusCode);
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
      message = exception.message;
    } else {
      this.logger.error('Non-Error thrown:', exception);
    }

    res.status(statusCode).json({
      statusCode,
      code,
      message,
      ...(details !== undefined ? { details } : {}),
      path: req.url,
      timestamp: new Date().toISOString(),
    });
  }
}

function inferCode(status: number): string {
  switch (status) {
    case 400:
      return 'VALIDATION_FAILED';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 429:
      return 'RATE_LIMITED';
    default:
      return 'INTERNAL_ERROR';
  }
}
