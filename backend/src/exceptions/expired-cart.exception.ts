import { HttpException, HttpStatus } from '@nestjs/common';

export class ExpiredCartException extends HttpException {
    constructor(message: string = 'Shopping cart has expired') {
        super(
            {
                statusCode: HttpStatus.GONE,
                message,
                error: 'ExpiredCart',
            },
            HttpStatus.GONE,
        );
    }
}
