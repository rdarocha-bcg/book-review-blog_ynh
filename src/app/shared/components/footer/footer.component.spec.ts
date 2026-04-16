import { ComponentFixture, TestBed } from '@angular/core/testing';
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
      imports: [FooterComponent],
      providers: [{ provide: SiteConfigService, useValue: { config: branding.asReadonly() } }],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display copyright', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toMatch(/©|Book Review Blog/);
  });
});
