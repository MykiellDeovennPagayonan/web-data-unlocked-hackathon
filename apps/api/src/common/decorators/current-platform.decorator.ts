import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface RequestWithPlatform {
  platform?: {
    platformId: string;
  };
}

export const CurrentPlatform = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithPlatform>();
    const platformId = request.platform?.platformId;

    if (!platformId) {
      throw new Error(
        'Platform ID not found in request - ensure ApiKeyGuard is applied',
      );
    }

    return platformId;
  },
);
