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

  it('should render a spinner element with animation classes', () => {
    const el = fixture.nativeElement as HTMLElement;
    const spinner = el.querySelector('.animate-spin.rounded-full');
    expect(spinner).toBeTruthy();
    expect(spinner?.classList.contains('h-12')).toBe(true);
    expect(spinner?.classList.contains('w-12')).toBe(true);
    expect(spinner?.classList.contains('border-b-2')).toBe(true);
  });
});
