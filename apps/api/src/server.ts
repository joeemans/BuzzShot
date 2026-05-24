import cookieParser from 'cookie-parser';
import helmetPackage from 'helmet';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { INestApplication } from '@nestjs/common';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { AppModule } from './app.module.js';
import type { Env } from './config/env.js';

const helmet = helmetPackage as unknown as () => RequestHandler;

function requestLogger(logger: Logger) {
  return (request: Request, response: Response, next: NextFunction) => {
    const startedAt = Date.now();
    response.on('finish', () => {
      logger.log(
        `${request.method} ${request.originalUrl} ${response.statusCode} ${Date.now() - startedAt}ms`,
      );
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

export async function createApiApp() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService<Env, true>);

  app.setGlobalPrefix('api');
  app.use(helmet());
  app.use(cookieParser());
  app.use(requestLogger(new Logger('HTTP')));
  app.use(rateLimiter());
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

  return app;
}

export async function createListeningApiApp() {
  const app = await createApiApp();
  app.enableShutdownHooks();
  return app;
}

export async function listen(app: INestApplication) {
  const config = app.get(ConfigService<Env, true>);
  const port = process.env.PORT
    ? Number(process.env.PORT)
    : config.get('API_PORT', { infer: true });

  await app.listen(port);
  new Logger('Bootstrap').log(`BuzzShot API listening on http://localhost:${port}/api`);
}
