import { CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor } from "@nestjs/common";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Observable, tap } from "rxjs";
import { Logger } from "winston";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) {}

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest();
        const { method, url, headers } = request;
        const userAgent = headers['user-agent'] || '';
        const startTime = Date.now();

        const logData = {
            method,
            url,
            userAgent,
            userId: request.user?.userId || null,
            organizationId: request.user?.organizationId || null,
        };

        this.logger.info('Incoming request', { ...logData, category: 'request' });

        return next.handle().pipe(
            tap({
                next: () => {
                    const response = context.switchToHttp().getResponse();
                    const duration = Date.now() - startTime;

                    const logEntry = {
                        ...logData,
                        statusCode: response.statusCode,
                        durationMs: duration,
                    };

                    this.logger.info('Request completed', { ...logEntry, category: 'request' });

                    if (duration > 100) {
                        this.logger.warn('Slow request', { ...logEntry, category: 'performance' });
                    }
                },
                error: (error) => {
                    const duration = Date.now() - startTime;

                    this.logger.error('Request failed', {
                        ...logData,
                        error: error.message,
                        stack: error.stack,
                        durationMs: duration,
                        category: 'request',
                    });
                }
            })
        )

    }
}