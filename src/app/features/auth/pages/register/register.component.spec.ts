import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '@core/services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['loadSession'], {
      isAuthenticatedSync: () => false,
    });
    (authService.loadSession as jasmine.Spy).and.returnValue(of(void 0));

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should explain YunoHost-managed accounts', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Create an account');
    expect(el.textContent).toContain('YunoHost');
  });
});
