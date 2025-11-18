import {
    Controller,
    Post,
    Body,
    ValidationPipe,
    Res,
    HttpCode,
    HttpStatus,
    Get,
} from '@nestjs/common';
import type { Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { LoginDto } from './login.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body(ValidationPipe) loginDto: LoginDto,
        @Res({ passthrough: true }) response: Response,
    ) {
        const result = await this.authService.login(loginDto);

        response.cookie('access_token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            maxAge: 14400000, // 4 horas
            path: '/',
        });

        return {
            message: 'Login successful',
            user: result.user,
        };
    }

    @Get('me')
    @HttpCode(HttpStatus.OK)
    async me(
        @CurrentUser() user: any,
    ) {
        const profile = await this.authService.getUserProfile(user.userId, user.organizationId);

        return profile;
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
