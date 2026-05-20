import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { randomUUID } from 'node:crypto';

type AuthUser = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
};

type StoredUser = AuthUser & {
  passwordHash: string;
};

@Injectable()
export class AuthService {
  private readonly users = new Map<string, StoredUser>();

  constructor(@Inject(JwtService) private readonly jwt: JwtService) {}

  async register(input: { email: string; username: string; displayName: string; password: string }) {
    const existing = [...this.users.values()].find(
      (user) => user.email === input.email || user.username === input.username,
    );
    if (existing) {
      throw new UnauthorizedException('Email or username is already in use.');
    }
    const user: StoredUser = {
      id: randomUUID(),
      email: input.email,
      username: input.username,
      displayName: input.displayName,
      avatarUrl: null,
      bio: null,
      passwordHash: await argon2.hash(input.password),
    };
    this.users.set(user.id, user);
    return this.sessionFor(user);
  }

  async login(input: { identifier: string; password: string }) {
    const user = [...this.users.values()].find(
      (candidate) => candidate.email === input.identifier || candidate.username === input.identifier,
    );
    if (!user || !(await argon2.verify(user.passwordHash, input.password))) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    return this.sessionFor(user);
  }

  refresh() {
    return {
      accessToken: this.jwt.sign({ sub: 'demo-user', username: 'demo' }),
      refreshToken: randomUUID(),
    };
  }

  currentUser(): AuthUser {
    return {
      id: 'demo-user',
      email: 'demo@buzzshot.local',
      username: 'demo',
      displayName: 'Demo User',
      avatarUrl: null,
      bio: 'Demo authenticated user.',
    };
  }

  private sessionFor(user: StoredUser) {
    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
    };
    return {
      user: safeUser,
      accessToken: this.jwt.sign({ sub: user.id, username: user.username }),
      refreshToken: randomUUID(),
    };
  }
}
