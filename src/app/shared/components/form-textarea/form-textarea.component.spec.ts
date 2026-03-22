import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormTextareaComponent } from './form-textarea.component';

describe('FormTextareaComponent', () => {
  let component: FormTextareaComponent;
  let fixture: ComponentFixture<FormTextareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormTextareaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormTextareaComponent);
    component = fixture.componentInstance;
    component.id = 'desc';
    component.label = 'Description';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render label and textarea', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('label')?.textContent).toContain('Description');
    expect(el.querySelector('textarea')).toBeTruthy();
  });

  it('should emit value on input', () => {
    spyOn(component.valueChange, 'emit');
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = 'some text';
    textarea.dispatchEvent(new Event('input'));
    expect(component.valueChange.emit).toHaveBeenCalledWith('some text');
  });
});
