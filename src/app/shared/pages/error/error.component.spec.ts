import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ErrorComponent } from './error.component';

describe('ErrorComponent', () => {
  let component: ErrorComponent;
  let fixture: ComponentFixture<ErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display default status and message', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(component.statusCode).toBe(500);
    expect(component.title).toBe('Server Error');
    expect(el.textContent).toContain('500');
    expect(el.textContent).toContain('Something went wrong');
  });

  it('should display custom status and message when set', () => {
    component.statusCode = 403;
    component.title = 'Forbidden';
    component.message = 'Access denied.';
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('403');
    expect(el.textContent).toContain('Forbidden');
    expect(el.textContent).toContain('Access denied');
  });
});
