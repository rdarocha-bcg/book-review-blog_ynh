import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AboutPageComponent } from './about-page.component';

describe('AboutPageComponent', () => {
  let component: AboutPageComponent;
  let fixture: ComponentFixture<AboutPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutPageComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AboutPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the main heading "À propos"', () => {
    const el = fixture.nativeElement as HTMLElement;
    const heading = el.querySelector('h1');
    expect(heading).toBeTruthy();
    expect(heading!.textContent).toContain('À propos');
  });

  it('should have aria-labelledby on the article element', () => {
    const el = fixture.nativeElement as HTMLElement;
    const article = el.querySelector('article[aria-labelledby="about-heading"]');
    expect(article).toBeTruthy();
  });

  it('should render the "Qui je suis" section', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Qui je suis');
  });

  it('should render the "La lecture, l\'écriture" section', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('La lecture, l\'écriture');
  });

  it('should render the "Ce que l\'on trouve ici" section', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Ce que l\'on trouve ici');
  });

  it('should contain a routerLink to /contact', () => {
    const el = fixture.nativeElement as HTMLElement;
    const link = el.querySelector('a[href="/contact"]');
    expect(link).toBeTruthy();
    expect(link!.textContent!.trim()).toContain('Me contacter');
  });
});
