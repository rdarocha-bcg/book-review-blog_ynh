import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent, PaginationEvent } from './pagination.component';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    component.currentPage = 2;
    component.totalPages = 10;
    component.total = 100;
    component.limit = 10;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute startIndex and endIndex correctly', () => {
    expect(component.startIndex).toBe(11);
    expect(component.endIndex).toBe(20);
  });

  it('should compute pageNumbers within range', () => {
    const pages = component.pageNumbers;
    expect(pages.length).toBeLessThanOrEqual(5);
    expect(pages.every((p) => p >= 1 && p <= component.totalPages)).toBe(true);
    expect(pages).toContain(component.currentPage);
  });

  it('should emit pageChange on previous when not on first page', () => {
    let emitted: PaginationEvent | undefined;
    component.pageChange.subscribe((e) => (emitted = e));
    component.onPrevious();
    expect(emitted).toEqual({ page: 1, limit: 10 });
  });

  it('should not emit on previous when on first page', () => {
    component.currentPage = 1;
    let emitted = false;
    component.pageChange.subscribe(() => (emitted = true));
    component.onPrevious();
    expect(emitted).toBe(false);
  });

  it('should emit pageChange on next when not on last page', () => {
    let emitted: PaginationEvent | undefined;
    component.pageChange.subscribe((e) => (emitted = e));
    component.onNext();
    expect(emitted).toEqual({ page: 3, limit: 10 });
  });

  it('should not emit on next when on last page', () => {
    component.currentPage = 10;
    let emitted = false;
    component.pageChange.subscribe(() => (emitted = true));
    component.onNext();
    expect(emitted).toBe(false);
  });

  it('should emit pageChange on page number click for valid page', () => {
    let emitted: PaginationEvent | undefined;
    component.pageChange.subscribe((e) => (emitted = e));
    component.onPageChange(5);
    expect(emitted).toEqual({ page: 5, limit: 10 });
  });

  it('should not emit on page number click when same page', () => {
    let emitted = false;
    component.pageChange.subscribe(() => (emitted = true));
    component.onPageChange(2);
    expect(emitted).toBe(false);
  });

  it('should emit page 1 and new limit on limit change', () => {
    let emitted: PaginationEvent | undefined;
    component.pageChange.subscribe((e) => (emitted = e));
    const event = { target: { value: '20' } } as unknown as Event;
    component.onLimitChange(event);
    expect(emitted).toEqual({ page: 1, limit: 20 });
  });

  it('should display total and range in template', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('100');
    expect(el.textContent).toContain('11');
    expect(el.textContent).toContain('20');
  });
});
