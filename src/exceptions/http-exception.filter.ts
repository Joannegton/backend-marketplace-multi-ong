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
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status: number;
        let message: string | string[];
        let error: string;

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
                error = exception.name;
            } else {
                message =
                    (exceptionResponse as any).message || exception.message;
                error = (exceptionResponse as any).error || exception.name;
            }

            if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
                this.logger.error(
                    `Error: ${message}`,
                    exception instanceof Error ? exception.stack : '',
                );
            }
        } else {
            status = HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
            error = 'Internal Server Error';

            this.logger.error(
                `Unexpected error: ${exception}`,
                exception instanceof Error ? exception.stack : '',
            );
        }

        const errorResponse: any = {
            statusCode: status,
            error,
            message,
        };

        if (status !== HttpStatus.NOT_FOUND) {
            this.logger.warn(
                `${request.method} ${request.url} - Status: ${status} - Message: ${JSON.stringify(message)}`,
            );
        }

        response.status(status).json(errorResponse);
    }
}
