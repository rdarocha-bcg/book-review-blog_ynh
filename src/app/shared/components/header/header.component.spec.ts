import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { HeaderComponent } from './header.component';
import { AuthService } from '@core/services/auth.service';
import { SSO_LOGOUT_REDIRECT } from '@core/tokens/sso-redirect.token';

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

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authService },
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
});
