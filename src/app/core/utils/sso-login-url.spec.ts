import { yunohostPortalLoginUrl } from './sso-login-url';

describe('yunohostPortalLoginUrl', () => {
  it('should build SSO URL with base64 r parameter', () => {
    const u = yunohostPortalLoginUrl('https://example.org/blog/admin', 'https://example.org');
    expect(u).toBe(
      'https://example.org/yunohost/sso?r=' +
        btoa(unescape(encodeURIComponent('https://example.org/blog/admin'))),
    );
  });
});
