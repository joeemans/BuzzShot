import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET ?? 'development-access-secret-change-me',
      signOptions: { expiresIn: Number(process.env.JWT_ACCESS_TTL_SECONDS ?? 900) },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
