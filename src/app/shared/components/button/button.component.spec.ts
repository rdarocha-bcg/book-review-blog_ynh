import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the label', () => {
    fixture.componentRef.setInput('label', 'Submit');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toContain('Submit');
  });

  it('should emit onClick when clicked', () => {
    let emitted = false;
    component.onClick.subscribe(() => (emitted = true));
    const button = fixture.nativeElement.querySelector('button');
    button?.click();
    expect(emitted).toBe(true);
  });

  it('should apply primary variant classes by default', () => {
    const classes = component.getClasses();
    expect(classes).toContain('bg-[var(--accent)]');
    expect(classes).toContain('text-[var(--primary)]');
  });

  it('should apply secondary variant classes when set', () => {
    component.variant = 'secondary';
    const classes = component.getClasses();
    expect(classes).toContain('bg-slate-700');
    expect(classes).toContain('text-white');
  });

  it('should apply danger variant classes when set', () => {
    component.variant = 'danger';
    const classes = component.getClasses();
    expect(classes).toContain('bg-red-600');
  });

  it('should apply size classes', () => {
    component.size = 'sm';
    expect(component.getClasses()).toContain('text-sm');
    component.size = 'lg';
    expect(component.getClasses()).toContain('text-lg');
  });

  it('should set disabled on the button when disabled or isLoading is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    let button = fixture.nativeElement.querySelector('button');
    expect(button?.hasAttribute('disabled')).toBe(true);

    fixture.componentRef.setInput('disabled', false);
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('button');
    expect(button?.hasAttribute('disabled')).toBe(true);
  });

  it('should show Loading when isLoading is true', () => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Loading');
  });
});
