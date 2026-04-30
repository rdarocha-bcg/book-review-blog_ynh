import { CanDeactivateFn } from '@angular/router';

/** Interface that form components must implement to support the guard. */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/**
 * Functional CanDeactivate guard.
 * Prompts the user before navigating away from a dirty form.
 */
export const canDeactivateGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  if (component?.hasUnsavedChanges?.()) {
    return window.confirm('Vous avez des modifications non sauvegardées. Quitter quand même ?');
  }
  return true;
};
