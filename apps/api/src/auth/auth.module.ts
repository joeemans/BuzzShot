import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../database/database.module.js';
import type { Env } from '../config/env.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { ApiAuthGuard } from './api-auth.guard.js';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get('JWT_ACCESS_SECRET', { infer: true }),
        signOptions: {
          audience: config.get('JWT_ACCESS_AUDIENCE', { infer: true }),
          expiresIn: config.get('JWT_ACCESS_TTL_SECONDS', { infer: true }),
          issuer: config.get('JWT_ACCESS_ISSUER', { infer: true }),
        },
        verifyOptions: {
          audience: config.get('JWT_ACCESS_AUDIENCE', { infer: true }),
          issuer: config.get('JWT_ACCESS_ISSUER', { infer: true }),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, ApiAuthGuard],
  exports: [AuthService, ApiAuthGuard],
})
export class AuthModule {}
