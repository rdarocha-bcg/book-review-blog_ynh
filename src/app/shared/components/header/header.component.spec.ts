import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { signal } from '@angular/core';
import { HeaderComponent } from './header.component';
import { SiteConfigService } from '@core/services/site-config.service';
import { DEFAULT_SITE_CONFIG } from '@core/models/site-config.model';
import { AuthService, AuthState } from '@core/services/auth.service';

function buildAuthStub(authState: AuthState | null) {
  const stateSignal = signal<AuthState | null>(authState);
  return { state: stateSignal.asReadonly() };
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  async function setup(authState: AuthState | null = null) {
    const branding = signal(DEFAULT_SITE_CONFIG);
    const siteConfigStub = { config: branding.asReadonly() };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule],
      providers: [
        { provide: SiteConfigService, useValue: siteConfigStub },
        { provide: AuthService, useValue: buildAuthStub(authState) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', async () => {
    await setup();
    expect(component).toBeTruthy();
  });

  it('should show non-admin nav links for unauthenticated user (no Admin link)', async () => {
    await setup(null);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Accueil');
    expect(el.textContent).toContain('Critiques');
    expect(el.textContent).toContain('Travaux');
    expect(el.textContent).toContain('À propos');
    expect(el.textContent).not.toContain('Admin');
  });

  it('should show Admin link when user is admin', async () => {
    await setup({
      authenticated: true,
      user: { id: '1', email: 'admin@example.com', name: 'Admin', role: 'admin' },
    });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Admin');
  });

  it('should hide Admin link when user is not admin', async () => {
    await setup({
      authenticated: true,
      user: { id: '2', email: 'user@example.com', name: 'User', role: 'user' },
    });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('Admin');
  });

  it('should have skip link and main nav with aria-label', async () => {
    await setup();
    const el = fixture.nativeElement as HTMLElement;
    const skip = el.querySelector('.skip-link');
    const nav = el.querySelector('nav[aria-label="Main navigation"]');
    expect(skip).toBeTruthy();
    expect(nav).toBeTruthy();
  });

  it('should toggle mobile menu and set aria-expanded', async () => {
    await setup();
    const el = fixture.nativeElement as HTMLElement;
    const toggle = el.querySelector('#mobile-nav-toggle') as HTMLButtonElement | null;
    expect(toggle).toBeTruthy();
    expect(toggle!.getAttribute('aria-expanded')).toBe('false');

    // Panel is always in the DOM (CSS slide-in transition), hidden when closed
    const panel = el.querySelector('#mobile-nav-panel');
    expect(panel).toBeTruthy();
    expect(panel!.getAttribute('aria-hidden')).toBe('true');

    toggle!.click();
    fixture.detectChanges();
    expect(toggle!.getAttribute('aria-expanded')).toBe('true');
    expect(panel!.getAttribute('aria-hidden')).toBeNull();

    toggle!.click();
    fixture.detectChanges();
    expect(toggle!.getAttribute('aria-expanded')).toBe('false');
    // Panel stays in DOM but is marked aria-hidden when closed
    expect(el.querySelector('#mobile-nav-panel')).toBeTruthy();
    expect(panel!.getAttribute('aria-hidden')).toBe('true');
  });
});
