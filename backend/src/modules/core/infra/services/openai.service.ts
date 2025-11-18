import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import OpenAI from 'openai';

@Injectable()
export class OpenAiService {
    private readonly openaiClient: OpenAI;

    constructor(
        private readonly configService: ConfigService,
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
    ) {
        const openaiApiKey = this.configService.get('OPENAI_API_KEY');
        this.openaiClient = new OpenAI({
            apiKey: openaiApiKey,
        });
    }

    async enhanceQuery(query: string): Promise<string> {
        try {
            const timeoutPromise = new Promise<string>((_, reject) =>
                setTimeout(() => reject(new Error('OpenAI API call timed out after 5s')), 5000)
            );

            const apiCallPromise = this.openaiClient.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content:
                            'Você é um assistente de busca para marketplace de produtos de ONGs. Dado uma query do usuário, retorne APENAS palavras-chave relevantes separadas por vírgula, sem explicações. Foco em termos que ajudam a encontrar produtos, não em sinônimos extensos. Máximo 7-10 termos principais.',
                    },
                    {
                        role: 'user',
                        content: `Query de busca: "${query}". Retorne apenas os termos principais (máximo 7-10).`,
                    },
                ],
                max_tokens: 20,
                temperature: 0,
            });

            const response = await Promise.race([apiCallPromise, timeoutPromise]);

            const enhancedQuery =
                typeof response === 'string' ? response :
                response.choices[0]?.message?.content?.trim() || query;

            return enhancedQuery;
        } catch (error) {
            if (error?.message?.includes('timed out')) {
                this.logger.error('GPT-4o-mini API call timed out (5s)', {
                    query,
                });
            } else {
                this.logger.error('GPT-4o-mini API call failed', {
                    query,
                    error: error?.message,
                    code: error?.code,
                });
            }
            throw error;
        }
    }
}
