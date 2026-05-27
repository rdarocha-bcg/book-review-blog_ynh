import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UnauthorizedComponent } from './unauthorized.component';

describe('UnauthorizedComponent', () => {
  let component: UnauthorizedComponent;
  let fixture: ComponentFixture<UnauthorizedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnauthorizedComponent, RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(UnauthorizedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display 401 and Unauthorized with navigation links', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('401');
    expect(el.textContent).toContain('Accès non autorisé');
    expect(el.querySelector('a[routerLink="/"]')).toBeTruthy();
    expect(el.querySelector('a[routerLink="/reviews"]')).toBeTruthy();
    expect(el.querySelector('a[routerLink="/contact"]')).toBeTruthy();
  });
});
