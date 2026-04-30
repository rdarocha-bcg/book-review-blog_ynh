import { HttpErrorResponse } from '@angular/common/http';

/**
 * Maps an HTTP error response to a user-friendly French message.
 * Prevents leaking internal server details (stack traces, SQL errors, etc.).
 */
export function mapHttpError(error: HttpErrorResponse): string {
  switch (error.status) {
    case 400:
      return 'Requête invalide.';
    case 401:
      return 'Vous devez être connecté.';
    case 403:
      return 'Accès refusé.';
    case 404:
      return 'Ressource introuvable.';
    case 422:
      return 'Les données envoyées sont invalides.';
    case 429:
      return 'Trop de requêtes. Veuillez patienter.';
    case 0:
      return 'Impossible de joindre le serveur. Vérifiez votre connexion.';
    default:
      if (error.status >= 500) {
        return 'Une erreur serveur est survenue. Veuillez réessayer.';
      }
      return 'Une erreur inattendue est survenue.';
  }
}
