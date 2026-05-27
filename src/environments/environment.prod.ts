import { IEnvironment } from './environment.interface';

export const environment: IEnvironment = {
  production: true,
  apiUrl: '/blog/api',
  features: {
    markdownPreview: true,
    adminAnalytics: true,
  },
};
