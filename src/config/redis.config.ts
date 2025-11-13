import { BullModuleOptions } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

export const getRedisConfig = (configService: ConfigService): BullModuleOptions => {
    const redisUrl = configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    return {
        redis: redisUrl,
        defaultJobOptions: {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
            removeOnComplete: true,
            removeOnFail: false,
        },
    };
};