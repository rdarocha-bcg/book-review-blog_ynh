/**
 * Production Environment
 * apiUrl and SSO URLs are replaced at deploy time (YunoHost install) from conf templates.
 */
export const environment = {
  production: true,
  apiUrl: '__API_PATH__',
  ssoLoginUrl: 'https://__DOMAIN__/yunohost/sso/',
  ssoLogoutUrl: 'https://__DOMAIN__/yunohost/sso/?action=logout',
};

