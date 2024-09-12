import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

export function getHostFromUrl(url: string): string {
  const hostWithPort = new URL(url).host;
  return hostWithPort.split(':')[0];
}

export function extractJwtTokenFromCookie(req: Request): string {
  const jwtCookie = getCookiesAsObject(req).jwt;
  if (!jwtCookie) {
    throw new UnauthorizedException('JWT cookie not found');
  }
  return jwtCookie;
}

export function getCookiesAsObject(req: Request): Record<string, string> {
  const cookies = req.headers.cookie?.split(';') ?? [];
  return cookies.reduce<Record<string, string>>((cookies, cookie) => {
    const [name, value] = cookie.split('=');
    return { ...cookies, [name.trim()]: value };
  }, {});
}
