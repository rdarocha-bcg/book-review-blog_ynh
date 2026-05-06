import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { BreadcrumbComponent } from './breadcrumb.component';

describe('BreadcrumbComponent', () => {
  let fixture: ComponentFixture<BreadcrumbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BreadcrumbComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(BreadcrumbComponent);
    fixture.componentRef.setInput('items', [
      { label: 'Home', routerLink: ['/'] },
      { label: 'Section', routerLink: ['/section'] },
      { label: 'Current' },
    ]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render nav with breadcrumb aria-label', () => {
    const nav = fixture.debugElement.query(By.css('nav[aria-label="Breadcrumb"]'));
    expect(nav).toBeTruthy();
  });

  it('should mark only the last item as current page', () => {
    const current = fixture.nativeElement.querySelector('[aria-current="page"]') as HTMLElement | null;
    expect(current?.textContent?.trim()).toBe('Current');
    expect(fixture.nativeElement.querySelectorAll('[aria-current="page"]').length).toBe(1);
  });

  it('should render links for non-final segments', () => {
    const links = fixture.nativeElement.querySelectorAll('a');
    expect(links.length).toBe(2);
  });
});
