/**
 * SSOWat sends YNH_USER (and related) via nginx; Node lowercases header names.
 * Only trust identity when the request comes from the local reverse proxy.
 */
export function getTrustedRemoteAddress(req) {
    const raw = req.socket.remoteAddress;
    if (!raw)
        return '';
    if (raw === '::1' || raw === '::ffff:127.0.0.1')
        return '127.0.0.1';
    return raw;
}
export function isTrustedProxySource(req) {
    const addr = getTrustedRemoteAddress(req);
    const trust = process.env.TRUST_SSO_HEADERS ?? 'auto';
    if (trust === 'never')
        return false;
    if (trust === 'always')
        return true;
    // Only trust SSOWat-injected headers when the TCP peer is local nginx (or dev proxy).
    return addr === '127.0.0.1';
}
function firstHeader(req, names) {
    const h = req.headers;
    for (const n of names) {
        const v = h[n];
        if (typeof v === 'string' && v.trim())
            return v.trim();
    }
    return undefined;
}
export function readYnhIdentity(req) {
    if (!isTrustedProxySource(req))
        return null;
    const uid = firstHeader(req, ['ynh-user', 'ynh_user']);
    if (!uid)
        return null;
    const email = firstHeader(req, ['ynh-user-email', 'ynh_user_email', 'ynh-user_email']) ?? null;
    const fullName = firstHeader(req, ['ynh-user-fullname', 'ynh_user_fullname', 'ynh-user_fullname']) ?? null;
    return { uid, email, fullName };
}
export function parseAdminUsernames() {
    const raw = process.env.ADMIN_USERNAMES ?? '';
    return new Set(raw
        .split(/[,;\s]+/)
        .map((s) => s.trim())
        .filter(Boolean));
}
export function isAppAdmin(uid) {
    return parseAdminUsernames().has(uid);
}
