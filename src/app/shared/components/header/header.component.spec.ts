import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { signal } from '@angular/core';
import { HeaderComponent } from './header.component';
import { AuthService } from '@core/services/auth.service';
import { SiteConfigService } from '@core/services/site-config.service';
import { DEFAULT_SITE_CONFIG } from '@core/models/site-config.model';
import { SSO_LOGOUT_REDIRECT } from '@core/tokens/sso-redirect.token';
import { ThemeService } from '@core/services/theme.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  const isAuth$ = new BehaviorSubject<boolean>(false);
  const user$ = new BehaviorSubject<{ name?: string; email?: string } | null>(null);

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['logout'], {
      isAuthenticated: () => isAuth$.asObservable(),
      getCurrentUser$: () => user$.asObservable(),
    });

    const branding = signal(DEFAULT_SITE_CONFIG);
    const siteConfigStub = { config: branding.asReadonly() };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: SiteConfigService, useValue: siteConfigStub },
        { provide: SSO_LOGOUT_REDIRECT, useValue: () => {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    isAuth$.next(false);
    user$.next(null);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show Login when not authenticated', () => {
    isAuth$.next(false);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Login');
  });

  it('should show Logout and New Review when authenticated', () => {
    isAuth$.next(true);
    user$.next({ name: 'Test User', email: 'test@test.com' });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Logout');
    expect(el.textContent).toContain('New Review');
  });

  it('should call authService.logout when logout is triggered', () => {
    component.logout();
    expect(authService.logout).toHaveBeenCalled();
  });

  it('should have skip link and main nav with aria-label', () => {
    const el = fixture.nativeElement as HTMLElement;
    const skip = el.querySelector('.skip-link');
    const nav = el.querySelector('nav[aria-label="Main navigation"]');
    expect(skip).toBeTruthy();
    expect(nav).toBeTruthy();
  });

  it('should cycle theme preference when theme control is activated', () => {
    const theme = TestBed.inject(ThemeService);
    const start = theme.preference();
    const el = fixture.nativeElement as HTMLElement;
    const btn = Array.from(el.querySelectorAll('button')).find((b) =>
      b.getAttribute('aria-label')?.startsWith('Color theme'),
    ) as HTMLButtonElement | undefined;
    expect(btn).toBeTruthy();
    btn!.click();
    fixture.detectChanges();
    expect(theme.preference()).not.toBe(start);
  });

  it('should toggle mobile menu and set aria-expanded', () => {
    const el = fixture.nativeElement as HTMLElement;
    const toggle = el.querySelector('#mobile-nav-toggle') as HTMLButtonElement | null;
    expect(toggle).toBeTruthy();
    expect(toggle!.getAttribute('aria-expanded')).toBe('false');
    toggle!.click();
    fixture.detectChanges();
    expect(toggle!.getAttribute('aria-expanded')).toBe('true');
    const panel = el.querySelector('#mobile-nav-panel');
    expect(panel).toBeTruthy();
    toggle!.click();
    fixture.detectChanges();
    expect(toggle!.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector('#mobile-nav-panel')).toBeFalsy();
  });
});
