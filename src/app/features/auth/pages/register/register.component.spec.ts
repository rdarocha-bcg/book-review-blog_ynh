import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '@core/services/auth.service';
import { NotificationService } from '@core/services/notification.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['register'], {
      isAuthenticatedSync: () => false,
    });

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule, RouterModule.forRoot([])],
      providers: [
        { provide: AuthService, useValue: authService },
        NotificationService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have register form with name, email, password, confirmPassword, agree', () => {
    expect(component.registerForm).toBeDefined();
    expect(component.registerForm.get('name')).toBeTruthy();
    expect(component.registerForm.get('email')).toBeTruthy();
    expect(component.registerForm.get('password')).toBeTruthy();
    expect(component.registerForm.get('confirmPassword')).toBeTruthy();
    expect(component.registerForm.get('agree')).toBeTruthy();
  });

  it('should render Create Account title and form', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Create Account');
    expect(el.querySelector('form')).toBeTruthy();
    expect(el.querySelector('input[type="email"]')).toBeTruthy();
    expect(el.querySelector('input[type="password"]')).toBeTruthy();
  });

  it('onSubmit should call authService.register when form is valid', () => {
    component.registerForm.setValue({
      name: 'Test User',
      email: 'u@test.com',
      password: 'pass123',
      confirmPassword: 'pass123',
      agree: true,
    });
    (authService.register as jasmine.Spy).and.returnValue(of({}));
    component.onSubmit();
    expect(authService.register).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'u@test.com',
      password: 'pass123',
    });
  });
});
