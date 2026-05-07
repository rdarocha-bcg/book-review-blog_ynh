import { canDeactivateGuard, HasUnsavedChanges } from './can-deactivate.guard';

describe('canDeactivateGuard', () => {
  let confirmSpy: jasmine.Spy;

  beforeEach(() => {
    confirmSpy = spyOn(window, 'confirm');
  });

  it('should return true and call confirm when component is dirty and user confirms', () => {
    confirmSpy.and.returnValue(true);
    const component: HasUnsavedChanges = { hasUnsavedChanges: () => true };

    const result = canDeactivateGuard(component, null!, null!, null!);

    expect(confirmSpy).toHaveBeenCalledOnceWith(
      'Vous avez des modifications non sauvegardées. Quitter quand même ?'
    );
    expect(result).toBeTrue();
  });

  it('should return false and call confirm when component is dirty and user cancels', () => {
    confirmSpy.and.returnValue(false);
    const component: HasUnsavedChanges = { hasUnsavedChanges: () => true };

    const result = canDeactivateGuard(component, null!, null!, null!);

    expect(confirmSpy).toHaveBeenCalledOnceWith(
      'Vous avez des modifications non sauvegardées. Quitter quand même ?'
    );
    expect(result).toBeFalse();
  });

  it('should return true without calling confirm when component is clean', () => {
    const component: HasUnsavedChanges = { hasUnsavedChanges: () => false };

    const result = canDeactivateGuard(component, null!, null!, null!);

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(result).toBeTrue();
  });

  it('should return true safely when component does not implement HasUnsavedChanges', () => {
    const component = {} as HasUnsavedChanges;

    const result = canDeactivateGuard(component, null!, null!, null!);

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(result).toBeTrue();
  });
});
