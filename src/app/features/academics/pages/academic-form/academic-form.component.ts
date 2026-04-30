import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  viewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AcademicService } from '../../services/academic.service';
import { NotificationService } from '@core/services/notification.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { Subject, takeUntil } from 'rxjs';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'app-academic-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    LoadingSpinnerComponent,
    MarkdownComponent,
  ],
  template: `
    <div class="page-container">
      <h1 class="text-4xl md:text-5xl font-bold mb-8 text-[var(--primary)]">
        {{ isEditMode ? 'Modifier le travail' : 'Nouveau travail académique' }}
      </h1>

      <div class="max-w-3xl pinterest-panel p-8 md:p-10">
        <form *ngIf="academicForm" [formGroup]="academicForm" (ngSubmit)="onSubmit()" class="space-y-6">

          <!-- Titre -->
          <div>
            <label for="title" class="block text-sm font-semibold mb-2 text-[var(--primary)]">Titre *</label>
            <input
              id="title"
              type="text"
              formControlName="title"
              placeholder="Titre du travail"
              class="w-full border border-[var(--border-light)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              [attr.aria-invalid]="isFieldInvalid('title')"
            />
            <p *ngIf="isFieldInvalid('title')" class="text-red-600 text-sm mt-1">Le titre est requis</p>
          </div>

          <!-- Résumé -->
          <div>
            <label for="summary" class="block text-sm font-semibold mb-2 text-[var(--primary)]">Résumé *</label>
            <textarea
              id="summary"
              formControlName="summary"
              placeholder="Résumé court du travail"
              rows="3"
              class="w-full border border-[var(--border-light)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              [attr.aria-invalid]="isFieldInvalid('summary')"
            ></textarea>
            <p
              [class]="(academicForm.get('summary')?.value?.length || 0) > 300
                ? 'text-sm text-red-500 text-right mt-1'
                : 'text-sm text-[var(--text-muted)] text-right mt-1'"
              aria-live="polite"
            >{{ academicForm.get('summary')?.value?.length || 0 }} / 300</p>
            <p *ngIf="isFieldInvalid('summary') && academicForm.get('summary')?.hasError('required')" class="text-red-600 text-sm mt-1">Le résumé est requis</p>
            <p *ngIf="isFieldInvalid('summary') && academicForm.get('summary')?.hasError('maxlength')" class="text-red-600 text-sm mt-1">Résumé trop long (max 300 caractères)</p>
          </div>

          <!-- Contenu — Markdown editor with preview toggle -->
          <div>
            <label for="content" class="block text-sm font-semibold mb-2 text-[var(--primary)]">Contenu</label>

            <!-- Tab bar + image upload button -->
            <div class="flex items-center justify-between mb-0">
              <div
                role="tablist"
                aria-label="Éditeur de contenu"
                class="flex rounded-t-xl overflow-hidden border border-b-0 border-[var(--border-light)]"
              >
                <button
                  type="button"
                  role="tab"
                  [attr.aria-selected]="activeTab === 'edit'"
                  [attr.aria-controls]="'content-edit-panel'"
                  id="tab-edit"
                  (click)="activeTab = 'edit'"
                  class="px-4 py-2 text-sm font-medium transition-colors min-w-[88px] min-h-[44px]"
                  [class.bg-[var(--surface-alt)]]="activeTab !== 'edit'"
                  [class.text-[var(--text-muted)]]="activeTab !== 'edit'"
                  [class.bg-white]="activeTab === 'edit'"
                  [class.text-[var(--primary)]]="activeTab === 'edit'"
                  [class.font-semibold]="activeTab === 'edit'"
                >Éditer</button>
                <button
                  type="button"
                  role="tab"
                  [attr.aria-selected]="activeTab === 'preview'"
                  [attr.aria-controls]="'content-preview-panel'"
                  id="tab-preview"
                  (click)="activeTab = 'preview'"
                  class="px-4 py-2 text-sm font-medium transition-colors min-w-[88px] min-h-[44px] border-l border-[var(--border-light)]"
                  [class.bg-[var(--surface-alt)]]="activeTab !== 'preview'"
                  [class.text-[var(--text-muted)]]="activeTab !== 'preview'"
                  [class.bg-white]="activeTab === 'preview'"
                  [class.text-[var(--primary)]]="activeTab === 'preview'"
                  [class.font-semibold]="activeTab === 'preview'"
                >Aperçu</button>
              </div>

              <!-- Insert image button — only visible in edit tab -->
              <button
                *ngIf="activeTab === 'edit'"
                type="button"
                (click)="triggerImageUpload()"
                [disabled]="isUploading"
                class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-[var(--border-light)] bg-white text-[var(--primary)] hover:bg-[var(--surface-alt)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                aria-label="Insérer une image"
              >
                <span *ngIf="!isUploading">
                  <svg xmlns="http://www.w3.org/2000/svg" class="inline w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Insérer une image
                </span>
                <span *ngIf="isUploading" class="flex items-center gap-2">
                  <svg class="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Envoi…
                </span>
              </button>
            </div>

            <!-- Hidden file input -->
            <input
              #imageFileInput
              type="file"
              accept="image/*"
              class="hidden"
              aria-hidden="true"
              (change)="onImageFileSelected($event)"
            />

            <!-- Edit panel -->
            <div
              id="content-edit-panel"
              role="tabpanel"
              aria-labelledby="tab-edit"
              [hidden]="activeTab !== 'edit'"
            >
              <textarea
                id="content"
                formControlName="content"
                placeholder="Contenu complet du travail (Markdown supporté)"
                rows="14"
                class="w-full border border-[var(--border-light)] rounded-b-xl rounded-tr-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm font-mono"
                #contentTextarea
              ></textarea>
            </div>

            <!-- Preview panel -->
            <div
              id="content-preview-panel"
              role="tabpanel"
              aria-labelledby="tab-preview"
              [hidden]="activeTab !== 'preview'"
              class="min-h-[14rem] border border-[var(--border-light)] rounded-b-xl rounded-tr-xl px-4 py-3 bg-white prose prose-sm max-w-none"
            >
              <markdown
                *ngIf="academicForm.get('content')?.value"
                [data]="academicForm.get('content')?.value"
              ></markdown>
              <p
                *ngIf="!academicForm.get('content')?.value"
                class="text-[var(--text-muted)] italic text-sm"
              >Aucun contenu à afficher.</p>
            </div>

            <!-- Upload error -->
            <p
              *ngIf="uploadError"
              aria-live="assertive"
              class="text-red-600 text-sm mt-1"
            >{{ uploadError }}</p>
          </div>

          <!-- Type de travail -->
          <div>
            <label for="workType" class="block text-sm font-semibold mb-2 text-[var(--primary)]">Type de travail *</label>
            <select
              id="workType"
              formControlName="workType"
              class="w-full border border-[var(--border-light)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              [attr.aria-invalid]="isFieldInvalid('workType')"
            >
              <option value="">Sélectionner un type</option>
              <option value="Dissertation">Dissertation</option>
              <option value="Commentaire de texte">Commentaire de texte</option>
              <option value="Dossier thématique">Dossier thématique</option>
              <option value="Mémoire">Mémoire</option>
              <option value="Travail de recherche">Travail de recherche</option>
              <option value="Synthèse">Synthèse</option>
              <option value="Note de lecture">Note de lecture</option>
              <option value="Compte-rendu">Compte-rendu</option>
              <option value="Communication">Communication</option>
              <option value="Essai">Essai</option>
              <option value="Rapport">Rapport</option>
              <option value="Autre">Autre</option>
            </select>
            <p *ngIf="isFieldInvalid('workType')" class="text-red-600 text-sm mt-1">Le type de travail est requis</p>
          </div>

          <!-- Contexte -->
          <div>
            <label for="context" class="block text-sm font-semibold mb-2 text-[var(--primary)]">Contexte</label>
            <input
              id="context"
              type="text"
              formControlName="context"
              placeholder="Contexte du travail"
              class="w-full border border-[var(--border-light)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          <!-- Année -->
          <div>
            <label for="year" class="block text-sm font-semibold mb-2 text-[var(--primary)]">Année</label>
            <input
              id="year"
              type="number"
              formControlName="year"
              placeholder="Année du travail"
              class="w-full border border-[var(--border-light)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          <!-- Thème -->
          <div>
            <label for="theme" class="block text-sm font-semibold mb-2 text-[var(--primary)]">Thème</label>
            <select
              id="theme"
              formControlName="theme"
              class="w-full border border-[var(--border-light)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="">Sélectionner un thème</option>
              <option value="literature">Littérature</option>
              <option value="philosophy">Philosophie</option>
              <option value="history">Histoire</option>
              <option value="linguistics">Linguistique</option>
            </select>
          </div>

          <!-- URL de l'image -->
          <div>
            <label for="imageUrl" class="block text-sm font-semibold mb-2 text-[var(--primary)]">URL de l'image</label>
            <input
              id="imageUrl"
              type="url"
              formControlName="imageUrl"
              placeholder="URL de l'image (optionnel)"
              class="w-full border border-[var(--border-light)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <p class="text-[var(--text-muted)] text-xs mt-1">Optionnel : URL d'une image illustrant le travail</p>
          </div>

          <!-- URL source -->
          <div>
            <label for="sourceUrl" class="block text-sm font-semibold mb-2 text-[var(--primary)]">URL source</label>
            <input
              id="sourceUrl"
              type="url"
              formControlName="sourceUrl"
              placeholder="URL de la source (optionnel)"
              class="w-full border border-[var(--border-light)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>

          <!-- Publié -->
          <div class="flex items-center gap-3">
            <input
              id="isPublished"
              type="checkbox"
              formControlName="isPublished"
              class="w-4 h-4 cursor-pointer"
            />
            <label for="isPublished" class="text-sm font-semibold cursor-pointer text-[var(--primary)]">
              Publier immédiatement
            </label>
          </div>

          <!-- Mis en avant -->
          <div class="flex items-center gap-3">
            <input
              id="featured"
              type="checkbox"
              formControlName="featured"
              class="w-4 h-4 cursor-pointer"
            />
            <label for="featured" class="text-sm font-semibold cursor-pointer text-[var(--primary)]">
              Mettre en avant
            </label>
          </div>

          <!-- Boutons -->
          <div class="flex gap-4 pt-4">
            <app-button
              [label]="isEditMode ? 'Mettre à jour' : 'Créer'"
              [isLoading]="isSubmitting"
              [disabled]="!academicForm.valid || isSubmitting"
              (onClick)="onSubmit()"
            ></app-button>
            <app-button
              label="Annuler"
              variant="secondary"
              [disabled]="isSubmitting"
              (onClick)="onCancel()"
            ></app-button>
          </div>
        </form>

        <app-loading-spinner *ngIf="isLoading"></app-loading-spinner>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AcademicFormComponent implements OnInit, OnDestroy {
  academicForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSubmitting = false;
  academicId: string | null = null;

  activeTab: 'edit' | 'preview' = 'edit';
  isUploading = false;
  uploadError: string | null = null;

  private readonly imageFileInput = viewChild.required<ElementRef<HTMLInputElement>>('imageFileInput');
  private readonly contentTextarea = viewChild<ElementRef<HTMLTextAreaElement>>('contentTextarea');

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private academicService: AcademicService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private location: Location,
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.academicId = params['id'];
        this.loadAcademic();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.academicForm = this.fb.group({
      title: ['', [Validators.required]],
      summary: ['', [Validators.required, Validators.maxLength(300)]],
      content: [''],
      imageUrl: [''],
      workType: ['', Validators.required],
      context: [''],
      year: [new Date().getFullYear()],
      theme: [null],
      sourceUrl: [''],
      isPublished: [false],
      featured: [false],
    });
  }

  private loadAcademic(): void {
    if (!this.academicId) return;

    this.isLoading = true;
    this.academicService
      .getAcademicById(this.academicId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (academic) => {
          this.academicForm.patchValue({
            ...academic,
            theme: academic.theme || null,
          });
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.notificationService.error('Impossible de charger le travail académique');
          console.error('Error loading academic:', error);
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.academicForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  triggerImageUpload(): void {
    this.imageFileInput().nativeElement.click();
  }

  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Reset the input so the same file can be re-selected if needed
    input.value = '';

    this.isUploading = true;
    this.uploadError = null;
    this.cdr.markForCheck();

    const formData = new FormData();
    formData.append('file', file);

    this.http
      .post<{ url: string }>('/blog/api/media/upload', formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.insertImageMarkdown(response.url);
          this.isUploading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Image upload error:', error);
          this.uploadError = "Échec de l'envoi de l'image. Veuillez réessayer.";
          this.isUploading = false;
          this.cdr.markForCheck();
        },
      });
  }

  private insertImageMarkdown(url: string): void {
    const contentControl = this.academicForm.get('content');
    if (!contentControl) return;

    const textarea = this.contentTextarea()?.nativeElement;
    const markdown = `![](${url})`;

    if (textarea) {
      const start = textarea.selectionStart ?? textarea.value.length;
      const end = textarea.selectionEnd ?? textarea.value.length;
      const current = contentControl.value as string ?? '';
      const before = current.substring(0, start);
      const after = current.substring(end);
      const separator = before.length > 0 && !before.endsWith('\n') ? '\n' : '';
      const newValue = before + separator + markdown + after;
      contentControl.setValue(newValue);

      // Restore cursor position after inserted text
      const newCursor = start + separator.length + markdown.length;
      setTimeout(() => {
        textarea.selectionStart = newCursor;
        textarea.selectionEnd = newCursor;
        textarea.focus();
      }, 0);
    } else {
      // Fallback: append to end
      const current = (contentControl.value as string) ?? '';
      const separator = current.length > 0 && !current.endsWith('\n') ? '\n' : '';
      contentControl.setValue(current + separator + markdown);
    }
  }

  onSubmit(): void {
    if (!this.academicForm.valid) {
      this.notificationService.warning('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isSubmitting = true;
    const formData = this.academicForm.value;

    const request = this.isEditMode
      ? this.academicService.updateAcademic(this.academicId!, formData)
      : this.academicService.createAcademic(formData);

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: (academic) => {
        this.notificationService.success(
          this.isEditMode ? 'Travail académique mis à jour' : 'Travail académique créé'
        );
        this.isSubmitting = false;
        this.router.navigate(['/academics', academic.id]);
      },
      error: (error) => {
        this.notificationService.error('Impossible de sauvegarder le travail académique');
        console.error('Error saving academic:', error);
        this.isSubmitting = false;
      },
    });
  }

  onCancel(): void {
    this.location.back();
  }
}
