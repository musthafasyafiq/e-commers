import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const options = this.reflector.get<RateLimitOptions>('rateLimit', context.getHandler());

    if (!options) {
      return true;
    }

    const key = this.getKey(request);
    const now = Date.now();
    const windowStart = now - options.windowMs;

    // Clean up old entries
    this.cleanupExpiredEntries(windowStart);

    const record = rateLimitStore.get(key);

    if (!record || record.resetTime <= now) {
      // Create new record or reset expired one
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + options.windowMs,
      });
      return true;
    }

    if (record.count >= options.maxRequests) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: options.message || 'Too many requests',
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count++;
    return true;
  }

  private getKey(request: Request): string {
    const ip = request.ip || request.connection.remoteAddress;
    const userAgent = request.get('User-Agent') || '';
    return `${ip}:${userAgent}`;
  }

  private cleanupExpiredEntries(windowStart: number): void {
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetTime <= windowStart) {
        rateLimitStore.delete(key);
      }
    }
  }
}
