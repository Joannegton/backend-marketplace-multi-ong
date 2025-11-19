import { OpenAiService } from './openai.service';

describe('OpenAiService', () => {
  let service: OpenAiService;
  let configService: any;
  let logger: any;

  beforeEach(() => {
    jest.setTimeout(10000);
    configService = { get: jest.fn().mockReturnValue('key') };
    logger = { error: jest.fn() };
    service = new OpenAiService(configService as any, logger as any);
  });

  it('returns enhanced query when API responds with choices', async () => {
    service['openaiClient'] = { chat: { completions: { create: jest.fn().mockResolvedValue({ choices: [{ message: { content: 'a,b,c' } }] }) } } } as any;
    const res = await service.enhanceQuery('q');
    expect(res).toBe('a,b,c');
  });

  it('throws when API times out', async () => {
    service['openaiClient'] = { chat: { completions: { create: jest.fn(() => new Promise(() => {})) } } } as any;
    await expect(service.enhanceQuery('q')).rejects.toThrow();
    expect(logger.error).toHaveBeenCalled();
  }, 15000);
});
