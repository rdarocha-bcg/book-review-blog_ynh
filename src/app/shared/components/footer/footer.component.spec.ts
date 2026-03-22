import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render About, Resources, Legal, Follow Us sections', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('About');
    expect(el.textContent).toContain('Resources');
    expect(el.textContent).toContain('Legal');
    expect(el.textContent).toContain('Follow Us');
  });

  it('should have link to blog and about', () => {
    const el = fixture.nativeElement as HTMLElement;
    const links = el.querySelectorAll('a[routerLink]');
    const hrefs = Array.from(links).map((a) => a.getAttribute('routerLink'));
    expect(hrefs.some((h) => h && (h.includes('blog') || h.includes('about')))).toBe(true);
  });

  it('should display copyright', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toMatch(/©|2025|Book Review Blog/);
  });
});
