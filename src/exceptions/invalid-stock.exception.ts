import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidStockException extends HttpException {
    constructor(message: string = 'Invalid stock') {
        super(
            {
                statusCode: HttpStatus.CONFLICT,
                message,
                error: 'InvalidStock',
            },
            HttpStatus.CONFLICT,
        );
    }
}
