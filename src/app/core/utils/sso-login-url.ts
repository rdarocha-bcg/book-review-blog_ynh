/**
 * YunoHost SSO portal login URL with return redirect (?r= base64 full URL).
 */
export function yunohostPortalLoginUrl(returnUrl: string, origin: string): string {
  const payload = btoa(unescape(encodeURIComponent(returnUrl)));
  return `${origin}/yunohost/sso?r=${payload}`;
}
