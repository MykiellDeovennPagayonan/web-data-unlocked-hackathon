import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        const client = new Redis(
          process.env.REDIS_URL ?? 'redis://localhost:6379',
          {
            lazyConnect: true,
            enableOfflineQueue: false,
          },
        );
        client.on('error', (err) => {
          console.warn('[Redis] connection error (non-fatal):', err.message);
        });
        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
