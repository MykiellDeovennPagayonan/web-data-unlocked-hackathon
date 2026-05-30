import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard';
import { ApiKeysService } from '../../modules/platform-management/api-keys/api-keys.service';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;
  let apiKeysService: jest.Mocked<ApiKeysService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyGuard,
        {
          provide: ApiKeysService,
          useValue: {
            validateApiKey: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<ApiKeyGuard>(ApiKeyGuard);
    apiKeysService = module.get(ApiKeysService);
  });

  function createContext(
    headers: Record<string, string | string[]>,
  ): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should allow access when a valid API key is provided', async () => {
    apiKeysService.validateApiKey.mockResolvedValue({
      id: 'key-1',
      platformId: 'platform-1',
    } as any);

    const context = createContext({ 'x-api-key': 'valid-key' });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(apiKeysService.validateApiKey).toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when API key header is missing', async () => {
    const context = createContext({});

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('API key required'),
    );
  });

  it('should throw UnauthorizedException when API key is invalid', async () => {
    apiKeysService.validateApiKey.mockResolvedValue(null);

    const context = createContext({ 'x-api-key': 'invalid-key' });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Invalid or expired API key'),
    );
  });

  it('should use the first key when x-api-key is sent multiple times', async () => {
    apiKeysService.validateApiKey.mockResolvedValue({
      id: 'key-1',
      platformId: 'platform-1',
    } as any);

    const context = createContext({ 'x-api-key': ['first-key', 'second-key'] });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(apiKeysService.validateApiKey).toHaveBeenCalledWith(
      expect.any(String),
    );
  });
});
