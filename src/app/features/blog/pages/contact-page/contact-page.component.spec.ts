import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ContactPageComponent } from './contact-page.component';

describe('ContactPageComponent', () => {
  let component: ContactPageComponent;
  let fixture: ComponentFixture<ContactPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactPageComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the main heading "Contact"', () => {
    const el = fixture.nativeElement as HTMLElement;
    const heading = el.querySelector('h1');
    expect(heading).toBeTruthy();
    expect(heading!.textContent).toContain('Contact');
  });

  it('should have aria-labelledby on the section element', () => {
    const el = fixture.nativeElement as HTMLElement;
    const section = el.querySelector('section[aria-labelledby="contact-heading"]');
    expect(section).toBeTruthy();
  });

  it('should render a mailto link to remidarocha@gmail.com', () => {
    const el = fixture.nativeElement as HTMLElement;
    const mailto = el.querySelector('a[href="mailto:remidarocha@gmail.com"]');
    expect(mailto).toBeTruthy();
  });

  it('should have an aria-label on the mailto link', () => {
    const el = fixture.nativeElement as HTMLElement;
    const mailto = el.querySelector('a[href="mailto:remidarocha@gmail.com"]');
    expect(mailto!.getAttribute('aria-label')).toContain('remidarocha@gmail.com');
  });

  it('should contain a back routerLink to /about', () => {
    const el = fixture.nativeElement as HTMLElement;
    const link = el.querySelector('a[href="/about"]');
    expect(link).toBeTruthy();
  });
});
