import type { FastifyRequest } from 'fastify';

export type YnhIdentity = {
  uid: string;
  email: string | null;
  fullName: string | null;
};

/**
 * SSOWat sends YNH_USER (and related) via nginx; Node lowercases header names.
 * Only trust identity when the request comes from the local reverse proxy.
 */
export function getTrustedRemoteAddress(req: FastifyRequest): string {
  const raw = req.socket.remoteAddress;
  if (!raw) return '';
  if (raw === '::1' || raw === '::ffff:127.0.0.1') return '127.0.0.1';
  return raw;
}

export function isTrustedProxySource(req: FastifyRequest): boolean {
  const addr = getTrustedRemoteAddress(req);
  const trust = process.env.TRUST_SSO_HEADERS ?? 'auto';
  if (trust === 'never') return false;
  if (trust === 'always') return true;
  // Only trust SSOWat-injected headers when the TCP peer is local nginx (or dev proxy).
  return addr === '127.0.0.1';
}

function firstHeader(req: FastifyRequest, names: string[]): string | undefined {
  const h = req.headers;
  for (const n of names) {
    const v = h[n];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return undefined;
}

/**
 * SSOWat (auth_header) always sets Authorization: Basic for logged-in users.
 * Some nginx builds mishandle underscore header names (YNH_USER); Basic is reliable from 127.0.0.1.
 */
function readBasicAuthUsername(req: FastifyRequest): string | null {
  const auth = req.headers.authorization;
  if (typeof auth !== 'string' || !auth.startsWith('Basic ')) return null;
  try {
    const decoded = Buffer.from(auth.slice(6).trim(), 'base64').toString('utf8');
    const colon = decoded.indexOf(':');
    if (colon <= 0) return null;
    const user = decoded.slice(0, colon).trim();
    return user || null;
  } catch {
    return null;
  }
}

export function readYnhIdentity(req: FastifyRequest): YnhIdentity | null {
  if (!isTrustedProxySource(req)) return null;

  const email =
    firstHeader(req, ['ynh-user-email', 'ynh_user_email', 'ynh-user_email']) ?? null;
  const fullName =
    firstHeader(req, ['ynh-user-fullname', 'ynh_user_fullname', 'ynh-user_fullname']) ?? null;

  const uidFromHeaders = firstHeader(req, ['ynh-user', 'ynh_user']);
  const uidFromBasic = readBasicAuthUsername(req);
  const uid = uidFromHeaders ?? uidFromBasic;
  if (!uid) return null;

  return { uid, email, fullName };
}

export function parseAdminUsernames(): Set<string> {
  const raw = process.env.ADMIN_USERNAMES ?? '';
  return new Set(
    raw
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

export function isAppAdmin(uid: string): boolean {
  return parseAdminUsernames().has(uid);
}
