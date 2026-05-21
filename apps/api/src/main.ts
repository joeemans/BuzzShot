import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module.js';
import type { Env } from './config/env.js';

function requestLogger(logger: Logger) {
  return (request: Request, response: Response, next: NextFunction) => {
    const startedAt = Date.now();
    response.on('finish', () => {
      logger.log(`${request.method} ${request.originalUrl} ${response.statusCode} ${Date.now() - startedAt}ms`);
    });
    next();
  };
}

function rateLimiter() {
  const hits = new Map<string, { count: number; resetAt: number }>();
  const windowMs = 60_000;
  const maxRequests = 180;

  return (request: Request, response: Response, next: NextFunction) => {
    const key = request.ip ?? 'unknown';
    const now = Date.now();
    const current = hits.get(key);

    if (!current || current.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    current.count += 1;
    if (current.count > maxRequests) {
      response.status(429).json({ message: 'Too many requests.' });
      return;
    }

    next();
  };
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService<Env, true>);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');
  app.use(helmet());
  app.use(cookieParser());
  app.use(requestLogger(new Logger('HTTP')));
  app.use(rateLimiter());
  app.enableShutdownHooks();
  app.enableCors({
    origin: [config.get('WEB_URL', { infer: true })],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = config.get('API_PORT', { infer: true });
  await app.listen(port);
  logger.log(`BuzzShot API listening on http://localhost:${port}/api`);
}

void bootstrap();
