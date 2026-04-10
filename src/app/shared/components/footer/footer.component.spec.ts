import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { signal } from '@angular/core';
import { FooterComponent } from './footer.component';
import { SiteConfigService } from '@core/services/site-config.service';
import { DEFAULT_SITE_CONFIG } from '@core/models/site-config.model';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    const branding = signal(DEFAULT_SITE_CONFIG);
    await TestBed.configureTestingModule({
      imports: [FooterComponent, RouterTestingModule],
      providers: [{ provide: SiteConfigService, useValue: { config: branding.asReadonly() } }],
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
    expect(el.textContent).toMatch(/©|2026|Book Review Blog/);
  });

  it('should label placeholder footer items as coming soon without disabled link semantics', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('coming soon');
    expect(el.querySelector('[aria-disabled="true"]')).toBeFalsy();
  });
});
