import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { signal } from '@angular/core';
import { HeaderComponent } from './header.component';
import { SiteConfigService } from '@core/services/site-config.service';
import { DEFAULT_SITE_CONFIG } from '@core/models/site-config.model';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    const branding = signal(DEFAULT_SITE_CONFIG);
    const siteConfigStub = { config: branding.asReadonly() };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule],
      providers: [{ provide: SiteConfigService, useValue: siteConfigStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show reviews, new review, and admin links', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Reviews');
    expect(el.textContent).toContain('New review');
    expect(el.textContent).toContain('Admin');
  });

  it('should have skip link and main nav with aria-label', () => {
    const el = fixture.nativeElement as HTMLElement;
    const skip = el.querySelector('.skip-link');
    const nav = el.querySelector('nav[aria-label="Main navigation"]');
    expect(skip).toBeTruthy();
    expect(nav).toBeTruthy();
  });

  it('should toggle mobile menu and set aria-expanded', () => {
    const el = fixture.nativeElement as HTMLElement;
    const toggle = el.querySelector('#mobile-nav-toggle') as HTMLButtonElement | null;
    expect(toggle).toBeTruthy();
    expect(toggle!.getAttribute('aria-expanded')).toBe('false');
    toggle!.click();
    fixture.detectChanges();
    expect(toggle!.getAttribute('aria-expanded')).toBe('true');
    const panel = el.querySelector('#mobile-nav-panel');
    expect(panel).toBeTruthy();
    toggle!.click();
    fixture.detectChanges();
    expect(toggle!.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector('#mobile-nav-panel')).toBeFalsy();
  });
});
