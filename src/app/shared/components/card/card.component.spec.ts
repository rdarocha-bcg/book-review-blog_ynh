import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply base card classes', () => {
    const classes = component.getClasses();
    expect(classes).toContain('bg-white/95');
    expect(classes).toContain('rounded-2xl');
    expect(classes).toContain('p-5');
  });

  it('should add hover classes when hoverable is true', () => {
    component.hoverable = true;
    const classes = component.getClasses();
    expect(classes).toContain('cursor-pointer');
    expect(classes).toContain('transition-shadow');
  });

  it('should not add hover classes when hoverable is false', () => {
    component.hoverable = false;
    const classes = component.getClasses();
    expect(classes).not.toContain('cursor-pointer');
  });

  it('should display title when provided', () => {
    fixture.componentRef.setInput('title', 'Test Card Title');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const titleEl = el.querySelector('h3');
    expect(titleEl?.textContent?.trim()).toBe('Test Card Title');
  });

  it('should not render h3 when title is empty', () => {
    fixture.componentRef.setInput('title', '');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const titleEl = el.querySelector('h3');
    expect(titleEl).toBeNull();
  });
});
