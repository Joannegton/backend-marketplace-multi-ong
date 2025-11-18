import { IsNotEmpty, IsString, IsOptional, MinLength } from 'class-validator';

export class CheckoutPaymentDto {
    @IsNotEmpty({ message: 'Payment provider is required' })
    @IsString({ message: 'Payment provider must be a string' })
    @MinLength(1, { message: 'Payment provider is required' })
    paymentProvider: string;

    @IsOptional()
    @IsString({ message: 'Payment token must be a string' })
    paymentToken?: string;

    @IsOptional()
    @IsString({ message: 'Reference must be a string' })
    reference?: string;
}
