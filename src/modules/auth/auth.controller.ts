import { Controller, Post, Body, ValidationPipe, Res, HttpCode, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { LoginDto } from './login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body(ValidationPipe) loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
        const result = await this.authService.login(loginDto);

        response.cookie('access_token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 3600000, // 1 hora
            path: '/',
        });

        return {
            message: 'Login successful',
            user: result.user,
        };
    }

    @Public()
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Res({ passthrough: true }) response: Response) {
        response.clearCookie('access_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            path: '/',
        });

        return { message: 'Logout successful' };
    }
}
