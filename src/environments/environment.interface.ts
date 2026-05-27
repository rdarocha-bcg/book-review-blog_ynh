/**
 * Typed contract for Angular environment files.
 * Both environment.ts and environment.prod.ts must satisfy this interface.
 */
export interface IEnvironment {
  production: boolean;
  apiUrl: string;
  features: {
    /** Show Écrire / Aperçu Markdown tabs in content forms. */
    markdownPreview: boolean;
    /** Enable inline analytics summary on the admin dashboard. */
    adminAnalytics: boolean;
  };
}
