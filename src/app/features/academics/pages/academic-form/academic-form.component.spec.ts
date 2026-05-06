import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMarkdown } from 'ngx-markdown';
import { AcademicFormComponent } from './academic-form.component';
import { AcademicService } from '../../services/academic.service';
import { NotificationService } from '@core/services/notification.service';
import { AcademicWork } from '../../models/academic.model';
import { of } from 'rxjs';

const mockAcademic: AcademicWork = {
  id: 'a1',
  title: 'Title',
  summary: 'Summary text',
  content: '',
  workType: 'Essai',
  context: '',
  year: 2024,
  theme: null,
  publishedAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'u1',
  isPublished: false,
  featured: false,
};

describe('AcademicFormComponent content tabs (a11y)', () => {
  let fixture: ComponentFixture<AcademicFormComponent>;
  let component: AcademicFormComponent;

  beforeEach(async () => {
    const academicStub = {
      getAcademicById: jasmine.createSpy('getAcademicById').and.returnValue(of(mockAcademic)),
      createAcademic: jasmine.createSpy('createAcademic').and.returnValue(of(mockAcademic)),
      updateAcademic: jasmine.createSpy('updateAcademic').and.returnValue(of(mockAcademic)),
    };
    const notifStub = jasmine.createSpyObj<NotificationService>('NotificationService', [
      'success',
      'error',
      'warning',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        AcademicFormComponent,
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: AcademicService, useValue: academicStub },
        { provide: NotificationService, useValue: notifStub },
        provideMarkdown(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AcademicFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('ArrowRight on Éditer tab switches to Aperçu', () => {
    component.activeTab = 'edit';
    fixture.detectChanges();
    const editBtn = fixture.nativeElement.querySelector('#tab-edit') as HTMLButtonElement;
    editBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(component.activeTab).toBe('preview');
  });

  it('ArrowRight on Aperçu tab wraps to Éditer', () => {
    component.activeTab = 'preview';
    fixture.detectChanges();
    const previewBtn = fixture.nativeElement.querySelector('#tab-preview') as HTMLButtonElement;
    previewBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(component.activeTab).toBe('edit');
  });

  it('Home selects Éditer tab', () => {
    component.activeTab = 'preview';
    fixture.detectChanges();
    const previewBtn = fixture.nativeElement.querySelector('#tab-preview') as HTMLButtonElement;
    previewBtn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(component.activeTab).toBe('edit');
  });
});
