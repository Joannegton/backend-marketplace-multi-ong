import {
    IsNotEmpty,
    IsString,
    IsEmail,
    MinLength,
    MaxLength,
    Matches,
    IsOptional
} from "class-validator";

export class CheckoutDto {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be a string' })
    @MinLength(2, { message: 'Name must be at least 2 characters long' })
    @MaxLength(100, { message: 'Name must be at most 100 characters long' })
    @Matches(/^[a-zA-ZÀ-ÿ\s]+$/, {
        message: 'Name must contain only letters and spaces'
    })
    name: string;

    @IsNotEmpty({ message: 'CPF is required' })
    @IsString({ message: 'CPF must be a string' })
    @Matches(/^\d{11}$/, {
        message: 'CPF must contain exactly 11 digits'
    })
    cpf: string;

    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email must have a valid format' })
    email: string;

    @IsNotEmpty({ message: 'CEP is required' })
    @IsString({ message: 'CEP must be a string' })
    @Matches(/^\d{8}$/, {
        message: 'CEP must contain exactly 8 digits'
    })
    cep: string;

    @IsNotEmpty({ message: 'Address is required' })
    @IsString({ message: 'Address must be a string' })
    @MinLength(5, { message: 'Address must be at least 5 characters long' })
    @MaxLength(200, { message: 'Address must be at most 200 characters long' })
    address: string;

    @IsNotEmpty({ message: 'Number is required' })
    @IsString({ message: 'Number must be a string' })
    @MinLength(1, { message: 'Number must be at least 1 character long' })
    @MaxLength(10, { message: 'Number must be at most 10 characters long' })
    number: string;
}