import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '@core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['loadSession'], {
      isAuthenticatedSync: () => false,
    });
    (authService.loadSession as jasmine.Spy).and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render SSO sign-in messaging', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Sign in');
    expect(el.textContent).toContain('YunoHost');
    expect(el.querySelector('a[href]')).toBeTruthy();
  });
});
