import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner.component';

describe('LoadingSpinnerComponent', () => {
  let component: LoadingSpinnerComponent;
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a container with flex layout', () => {
    const el = fixture.nativeElement as HTMLElement;
    const container = el.querySelector('.flex.items-center.justify-center');
    expect(container).toBeTruthy();
  });

  it('should render a spinner ring with size and border classes', () => {
    const el = fixture.nativeElement as HTMLElement;
    const spinner = el.querySelector('.spinner-ring');
    expect(spinner).toBeTruthy();
    expect(spinner?.classList.contains('h-12')).toBe(true);
    expect(spinner?.classList.contains('w-12')).toBe(true);
    expect(spinner?.classList.contains('border-b-2')).toBe(true);
  });

  it('should expose status for assistive technologies', () => {
    const el = fixture.nativeElement as HTMLElement;
    const region = el.querySelector('[role="status"]');
    expect(region).toBeTruthy();
    expect(el.textContent).toContain('Loading');
  });
});
