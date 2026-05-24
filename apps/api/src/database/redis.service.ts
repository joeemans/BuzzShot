import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import type { Env } from '../config/env.js';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;
  private unavailableUntil = 0;
  private lastErrorLogAt = 0;

  constructor(@Inject(ConfigService) config: ConfigService<Env, true>) {
    this.client = new Redis(config.get('REDIS_URL', { infer: true }), {
      lazyConnect: true,
      enableOfflineQueue: false,
      connectTimeout: 1000,
      maxRetriesPerRequest: 1,
      retryStrategy: (attempt) => (attempt <= 1 ? 100 : null),
    });

    this.client.on('error', (error) => {
      this.markUnavailable(error);
    });
  }

  async getJson<T>(key: string): Promise<T | null> {
    try {
      if (!(await this.ensureConnected())) return null;
      const value = await this.client.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      this.markUnavailable(error);
      return null;
    }
  }

  async setJson(key: string, value: unknown, ttlSeconds: number) {
    try {
      if (!(await this.ensureConnected())) return;
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (error) {
      this.markUnavailable(error);
      return;
    }
  }

  async onModuleDestroy() {
    this.client.disconnect();
  }

  private async ensureConnected() {
    if (this.client.status === 'ready') return true;
    if (Date.now() < this.unavailableUntil) return false;

    try {
      await this.client.connect();
      return true;
    } catch (error) {
      this.markUnavailable(error);
      return false;
    }
  }

  private markUnavailable(error: unknown) {
    this.unavailableUntil = Date.now() + 10_000;

    if (Date.now() - this.lastErrorLogAt < 60_000) return;
    this.lastErrorLogAt = Date.now();
    const message = error instanceof Error ? error.message : 'Unknown Redis error.';
    this.logger.warn(`Redis cache unavailable; retrying shortly. ${message}`);
  }
}
