import { HttpErrorResponse } from '@angular/common/http';
import { mapErrorToUserMessage, mapHttpError } from './http-error.utils';

describe('http-error.utils', () => {
  describe('mapHttpError', () => {
    it('maps 500 to a generic server message', () => {
      const err = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' });
      expect(mapHttpError(err)).toBe('Une erreur serveur est survenue. Veuillez réessayer.');
    });

    it('maps 404', () => {
      const err = new HttpErrorResponse({ status: 404 });
      expect(mapHttpError(err)).toBe('Ressource introuvable.');
    });
  });

  describe('mapErrorToUserMessage', () => {
    it('delegates HttpErrorResponse to mapHttpError', () => {
      const err = new HttpErrorResponse({ status: 0 });
      expect(mapErrorToUserMessage(err)).toBe(mapHttpError(err));
    });

    it('returns a generic message for non-HTTP errors', () => {
      expect(mapErrorToUserMessage(new Error('<script>evil</script>'))).toBe(
        'Une erreur inattendue est survenue. Veuillez réessayer.',
      );
    });
  });
});
