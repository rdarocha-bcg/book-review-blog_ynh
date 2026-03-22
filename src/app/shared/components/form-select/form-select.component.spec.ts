import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormSelectComponent } from './form-select.component';

describe('FormSelectComponent', () => {
  let component: FormSelectComponent;
  let fixture: ComponentFixture<FormSelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormSelectComponent);
    component = fixture.componentInstance;
    component.id = 'genre';
    component.label = 'Genre';
    component.options = [
      { label: 'Fiction', value: 'fiction' },
      { label: 'Non-Fiction', value: 'non-fiction' },
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render label and select with options', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('label')?.textContent).toContain('Genre');
    const select = el.querySelector('select');
    expect(select).toBeTruthy();
    expect(select?.querySelectorAll('option').length).toBe(3); // placeholder + 2 options
  });

  it('should emit value on change', () => {
    spyOn(component.valueChange, 'emit');
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 'fiction';
    select.dispatchEvent(new Event('change'));
    expect(component.valueChange.emit).toHaveBeenCalledWith('fiction');
  });
});
