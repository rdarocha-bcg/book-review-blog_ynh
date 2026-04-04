/**
 * Dev proxy: forwards /api to the local Fastify API and injects SSOWat-style headers
 * (same names Node.js exposes as lowercase).
 */
module.exports = {
  '/api': {
    target: 'http://127.0.0.1:3000',
    secure: false,
    changeOrigin: true,
    onProxyReq(proxyReq) {
      proxyReq.setHeader('ynh-user', process.env.DEV_YNH_USER || 'devuser');
      proxyReq.setHeader('ynh-user-email', process.env.DEV_YNH_USER_EMAIL || 'dev@example.local');
      proxyReq.setHeader('ynh-user-fullname', process.env.DEV_YNH_USER_FULLNAME || 'Dev User');
    },
  },
};
