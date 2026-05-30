import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { ApiKeysService } from '../../modules/platform-management/api-keys/api-keys.service';

interface RequestWithPlatform {
  platform?: {
    platformId: string;
  };
  headers: {
    'x-api-key'?: string;
    [key: string]: string | string[] | undefined;
  };
}

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithPlatform>();
    const rawApiKey = request.headers['x-api-key'] as
      | string
      | string[]
      | undefined;
    const apiKey = Array.isArray(rawApiKey) ? rawApiKey[0] : rawApiKey;

    if (!apiKey) {
      throw new UnauthorizedException('API key required');
    }

    // Hash the raw key for validation
    const keyHash = createHash('sha256').update(apiKey).digest('hex');
    const validatedKey = await this.apiKeysService.validateApiKey(keyHash);

    if (!validatedKey) {
      throw new UnauthorizedException('Invalid or expired API key');
    }

    // Attach platform context to request
    request.platform = {
      platformId: validatedKey.platformId,
    };

    return true;
  }
}
