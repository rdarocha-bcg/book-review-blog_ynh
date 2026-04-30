import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { AcademicWork } from '../../models/academic.model';
import { AcademicListComponent } from './academic-list.component';
import { AcademicService } from '../../services/academic.service';

describe('AcademicListComponent', () => {
  let component: AcademicListComponent;
  let fixture: ComponentFixture<AcademicListComponent>;
  let mockAcademicService: jasmine.SpyObj<AcademicService>;
  let router: Router;
  const academicsSubject = new BehaviorSubject<AcademicWork[]>([]);
  const loadingSubject = new BehaviorSubject<boolean>(false);
  const queryParamsSubject = new BehaviorSubject<Params>({});

  beforeEach(async () => {
    mockAcademicService = jasmine.createSpyObj('AcademicService', ['getAcademics', 'getAcademics$', 'getLoading$']);
    mockAcademicService.getAcademics$.and.returnValue(academicsSubject.asObservable());
    mockAcademicService.getLoading$.and.returnValue(loadingSubject.asObservable());
    mockAcademicService.getAcademics.and.returnValue(of({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    }));

    await TestBed.configureTestingModule({
      imports: [AcademicListComponent, RouterTestingModule],
      providers: [
        { provide: AcademicService, useValue: mockAcademicService },
        { provide: ActivatedRoute, useValue: { queryParams: queryParamsSubject.asObservable() } },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(AcademicListComponent);
    component = fixture.componentInstance;
    loadingSubject.next(false);
    academicsSubject.next([]);
    queryParamsSubject.next({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call getAcademics on init (triggered by queryParams emission)', () => {
    expect(mockAcademicService.getAcademics).toHaveBeenCalled();
  });

  it('should initialize filters from URL query params', () => {
    queryParamsSubject.next({ theme: 'literature', sort: 'newest', page: '2', search: 'test' });
    fixture.detectChanges();
    expect(component.selectedTheme).toBe('literature');
    expect(component.selectedSort).toBe('newest');
    expect(component.currentPage).toBe(2);
    expect(component.searchQuery).toBe('test');
  });

  it('should call getAcademics with filters from URL query params', () => {
    mockAcademicService.getAcademics.calls.reset();
    queryParamsSubject.next({ theme: 'philosophy', page: '2' });
    fixture.detectChanges();
    expect(mockAcademicService.getAcademics).toHaveBeenCalledWith(jasmine.objectContaining({
      theme: 'philosophy',
      page: 2,
    }));
  });

  it('should show skeleton placeholders and aria-busy while loading', () => {
    loadingSubject.next(true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('app-review-card-skeleton').length).toBe(6);
    const region = el.querySelector('[aria-live="polite"]');
    expect(region?.getAttribute('aria-busy')).toBe('true');
    loadingSubject.next(false);
    fixture.detectChanges();
    expect(el.querySelectorAll('app-review-card-skeleton').length).toBe(0);
    expect(region?.getAttribute('aria-busy')).toBe('false');
  });

  it('should call router.navigate with current filters when onFilterChange is called', () => {
    component.selectedTheme = 'literature';
    component.onFilterChange();
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: jasmine.objectContaining({ theme: 'literature' }),
      queryParamsHandling: 'merge',
    }));
  });

  it('should reset currentPage to 1 when onFilterChange is called', () => {
    component.currentPage = 3;
    component.onFilterChange();
    expect(component.currentPage).toBe(1);
  });

  it('should debounce search input and sync URL params after delay', fakeAsync(() => {
    component.currentPage = 3;
    component.searchQuery = 'roman';
    component.onSearchQueryInput();
    expect(router.navigate).not.toHaveBeenCalled();
    tick(350);
    expect(component.currentPage).toBe(1);
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: jasmine.objectContaining({ search: 'roman' }),
      queryParamsHandling: 'merge',
    }));
  }));

  it('should reset filters and navigate with null params on resetFilters', () => {
    component.searchQuery = 'test';
    component.selectedTheme = 'literature';
    component.resetFilters();
    expect(component.searchQuery).toBe('');
    expect(component.selectedTheme).toBe('');
    expect(component.currentPage).toBe(1);
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: jasmine.objectContaining({ search: null, theme: null }),
      queryParamsHandling: 'merge',
    }));
  });

  it('should call router.navigate on pagination change', () => {
    component.onPaginationChange({ page: 2, limit: 20 });
    expect(component.currentPage).toBe(2);
    expect(component.pageSize).toBe(20);
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: jasmine.objectContaining({ page: 2 }),
      queryParamsHandling: 'merge',
    }));
  });

  it('should omit page param from URL when on page 1', () => {
    component.currentPage = 1;
    component.onFilterChange();
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: jasmine.objectContaining({ page: null }),
    }));
  });

  it('should render one routerLink per academic card (no duplicate navigation targets)', () => {
    academicsSubject.next([
      {
        id: '1',
        title: 'T',
        summary: 's',
        content: 'c',
        workType: 'thesis',
        context: 'ctx',
        year: 2020,
        publishedAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'u',
        isPublished: true,
      },
    ]);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const links = el.querySelectorAll('a[href="/academics/1"]');
    expect(links.length).toBe(1);
  });

  it('should track academics by id', () => {
    const academic: AcademicWork = {
      id: '1',
      title: 'Test',
      summary: 's',
      content: 'c',
      workType: 'thesis',
      context: 'ctx',
      year: 2020,
      publishedAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'u',
      isPublished: true,
    };
    expect(component.trackByAcademicId(0, academic)).toBe('1');
  });
});
