import { createHmac, timingSafeEqual } from 'node:crypto';
import type { FastifyRequest } from 'fastify';

export type PortalCookieIdentity = {
  uid: string;
  email: string | null;
  fullName: string | null;
};

type PortalJwtPayload = {
  user?: string;
  email?: string;
  fullname?: string;
  host?: string;
};

function base64UrlDecode(segment: string): Buffer {
  const padded = segment + '='.repeat((4 - (segment.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

function readPortalCookieToken(req: FastifyRequest): string | null {
  const cookie = req.headers.cookie;
  if (typeof cookie !== 'string') return null;
  const match = /(?:^|;\s*)yunohost\.portal=([^;]+)/.exec(cookie);
  return match?.[1]?.trim() ?? null;
}

function requestHost(req: FastifyRequest): string | null {
  const forwarded = req.headers['x-forwarded-host'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0]?.trim().toLowerCase() ?? null;
  }
  const host = req.headers.host;
  if (typeof host === 'string' && host.trim()) {
    return host.split(':')[0]?.trim().toLowerCase() ?? null;
  }
  return null;
}

function verifyHs256(token: string, secret: string): PortalJwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  if (!header || !payload || !signature) return null;

  try {
    const headerJson = JSON.parse(base64UrlDecode(header).toString('utf8')) as { alg?: string };
    if (headerJson.alg !== 'HS256') return null;

    const expected = createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest();
    const actual = base64UrlDecode(signature);
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      return null;
    }

    return JSON.parse(base64UrlDecode(payload).toString('utf8')) as PortalJwtPayload;
  } catch {
    return null;
  }
}

/**
 * Fallback when SSOWat-injected headers are missing: verify yunohost.portal JWT
 * (same secret as /etc/yunohost/.ssowat_cookie_secret, provisioned in api/.env on YunoHost).
 */
export function readPortalCookieIdentity(req: FastifyRequest): PortalCookieIdentity | null {
  const secret = process.env.YNH_SSO_COOKIE_SECRET?.trim();
  if (!secret) return null;

  const token = readPortalCookieToken(req);
  if (!token) return null;

  const payload = verifyHs256(token, secret);
  if (!payload?.user?.trim()) return null;

  const jwtHost = payload.host?.trim().toLowerCase();
  const reqHost = requestHost(req);
  if (jwtHost && reqHost && jwtHost !== reqHost && !reqHost.endsWith(`.${jwtHost}`)) {
    return null;
  }

  return {
    uid: payload.user.trim(),
    email: payload.email?.trim() || null,
    fullName: payload.fullname?.trim() || null,
  };
}
