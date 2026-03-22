import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['login'], {
      isAuthenticatedSync: () => false,
    });

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        ReactiveFormsModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: AuthService, useValue: authService },
        NotificationService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a login form with email and password', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('email')).toBeTruthy();
    expect(component.loginForm.get('password')).toBeTruthy();
  });

  it('should render Login title and form', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Login');
    expect(el.querySelector('form')).toBeTruthy();
    expect(el.querySelector('input[type="email"]')).toBeTruthy();
    expect(el.querySelector('input[type="password"]')).toBeTruthy();
  });

  it('isFieldInvalid should return false for untouched valid field', () => {
    expect(component.isFieldInvalid('email')).toBe(false);
  });

  it('onSubmit should call authService.login with form values when form is valid', () => {
    component.loginForm.setValue({
      email: 'u@test.com',
      password: 'pass123',
      rememberMe: false,
    });
    (authService.login as jasmine.Spy).and.returnValue(
      of({ token: 'token', user: {} } as unknown)
    );
    component.onSubmit();
    expect(authService.login).toHaveBeenCalledWith({
      email: 'u@test.com',
      password: 'pass123',
    });
  });
});
