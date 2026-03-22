import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormInputComponent } from './form-input.component';

describe('FormInputComponent', () => {
  let component: FormInputComponent;
  let fixture: ComponentFixture<FormInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormInputComponent);
    component = fixture.componentInstance;
    component.id = 'test-id';
    component.label = 'Test Label';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render label and input', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('label')?.textContent).toContain('Test Label');
    expect(el.querySelector('input')).toBeTruthy();
  });

  it('should emit value on input', () => {
    spyOn(component.valueChange, 'emit');
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'hello';
    input.dispatchEvent(new Event('input'));
    expect(component.valueChange.emit).toHaveBeenCalledWith('hello');
  });

  it('errorId should include id', () => {
    expect(component.errorId).toBe('test-id-error');
  });
});
