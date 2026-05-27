import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, viewChild, ElementRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import { NotificationService } from '@core/services/notification.service';
import { LoggerService } from '@core/services/logger.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { StarRatingInputComponent } from '@shared/components/star-rating-input/star-rating-input.component';
import {
  BreadcrumbComponent,
  BreadcrumbItem,
} from '@shared/components/breadcrumb/breadcrumb.component';
import { HasUnsavedChanges } from '@core/guards/can-deactivate.guard';
import { Subject, takeUntil } from 'rxjs';
import { MarkdownComponent } from 'ngx-markdown';

/**
 * Review Form Component
 * Create and edit book reviews
 */
@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    LoadingSpinnerComponent,
    StarRatingInputComponent,
    BreadcrumbComponent,
    MarkdownComponent,
  ],
  template: `
    <div class="page-container">
      <app-breadcrumb [items]="reviewFormBreadcrumbs()" />
      <h1 class="text-4xl md:text-5xl font-bold mb-8 text-[var(--primary)]">
        {{ isEditMode ? 'Modifier la critique' : 'Créer une critique' }}
      </h1>

      <div class="max-w-3xl pinterest-panel p-8 md:p-10">
        <form *ngIf="reviewForm" [formGroup]="reviewForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Titre de la critique -->
          <div>
            <label for="title" class="block text-sm font-semibold mb-2 text-[var(--primary)]">Titre de la critique *</label>
            <input
              id="title"
              type="text"
              formControlName="title"
              placeholder="Saisir le titre de la critique"
              class="w-full border border-[var(--border-light)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              aria-required="true"
              [attr.aria-label]="'Titre de la critique'"
              [attr.aria-invalid]="isFieldInvalid('title')"
            />
            <p *ngIf="isFieldInvalid('title')" class="text-red-600 text-sm mt-1">Le titre est requis</p>
          </div>

          <!-- Titre du livre -->
          <div>
            <label for="bookTitle" class="block text-sm font-semibold mb-2 text-[var(--primary)]">Titre du livre *</label>
            <input
              id="bookTitle"
              type="text"
              formControlName="bookTitle"
              placeholder="Saisir le titre du livre"
              class="w-full border border-[var(--border-light)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              aria-required="true"
              [attr.aria-label]="'Titre du livre'"
              [attr.aria-invalid]="isFieldInvalid('bookTitle')"
            />
            <p *ngIf="isFieldInvalid('bookTitle')" class="text-red-600 text-sm mt-1">Le titre du livre est requis</p>
          </div>

          <!-- Auteur du livre -->
          <div>
            <label for="bookAuthor" class="block text-sm font-semibold mb-2 text-[var(--primary)]">Auteur du livre *</label>
            <input
              id="bookAuthor"
              type="text"
              formControlName="bookAuthor"
              placeholder="Saisir le nom de l'auteur"
              class="w-full border border-[var(--border-light)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              aria-required="true"
              [attr.aria-label]="'Auteur du livre'"
              [attr.aria-invalid]="isFieldInvalid('bookAuthor')"
            />
            <p *ngIf="isFieldInvalid('bookAuthor')" class="text-red-600 text-sm mt-1">L'auteur du livre est requis</p>
          </div>

          <!-- Genre -->
          <div>
            <label for="genre" class="block text-sm font-semibold mb-2 text-[var(--primary)]">Genre *</label>
            <select
              id="genre"
              formControlName="genre"
              class="w-full border border-[var(--border-light)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              aria-required="true"
              [attr.aria-label]="'Genre'"
              [attr.aria-invalid]="isFieldInvalid('genre')"
            >
              <option value="">Sélectionner un genre</option>
              <option value="fiction">Fiction</option>
              <option value="non-fiction">Non-fiction</option>
              <option value="mystery">Policier</option>
              <option value="romance">Romance</option>
              <option value="science-fiction">Science-fiction</option>
              <option value="fantasy">Fantasy</option>
              <option value="biography">Biographie</option>
              <option value="history">Histoire</option>
              <option value="self-help">Développement personnel</option>
              <option value="other">Autre</option>
            </select>
            <p *ngIf="isFieldInvalid('genre')" class="text-red-600 text-sm mt-1">Le genre est requis</p>
          </div>

          <!-- Note -->
          <fieldset class="border-0 p-0 m-0">
            <legend id="rating-legend" class="block text-sm font-semibold mb-2 text-[var(--primary)]">
              Note (1–5) <span class="text-red-600" aria-hidden="true">*</span>
            </legend>
            <app-star-rating-input formControlName="rating" labelledBy="rating-legend" />
            <p *ngIf="isFieldInvalid('rating')" class="text-red-600 text-sm mt-1" role="alert">
              La note doit être entre 1 et 5
            </p>
          </fieldset>

          <!-- Description courte -->
          <div>
            <label for="description" class="block text-sm font-semibold mb-2 text-[var(--primary)]">Description *</label>
            <textarea
              id="description"
              formControlName="description"
              placeholder="Saisir une courte description (300 caractères max)"
              rows="3"
              maxlength="300"
              class="w-full border border-[var(--border-light)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              aria-required="true"
              [attr.aria-label]="'Description'"
              [attr.aria-invalid]="isFieldInvalid('description')"
            ></textarea>
            <p *ngIf="isFieldInvalid('description')" class="text-red-600 text-sm mt-1">
              La description est requise
            </p>
            <p class="text-[var(--text-muted)] text-xs mt-1">
              {{ reviewForm.get('description')?.value?.length || 0 }}/300 caractères
            </p>
          </div>

          <!-- Contenu complet — Markdown editor with preview toggle -->
          <div>
            <label for="content" class="block text-sm font-semibold mb-2 text-[var(--primary)]">Critique complète *</label>

            <div
              role="tablist"
              aria-label="Éditeur de contenu"
              class="flex w-full rounded-t-xl overflow-hidden border border-b-0 border-[var(--border-light)]"
            >
              <button
                type="button"
                #contentTabEdit
                role="tab"
                [attr.aria-selected]="activeTab === 'edit'"
                aria-controls="review-content-edit-panel"
                id="review-tab-edit"
                [attr.tabindex]="activeTab === 'edit' ? 0 : -1"
                (click)="activeTab = 'edit'"
                (keydown)="onContentTabKeydown($event)"
                class="px-4 py-2 text-sm font-medium transition-colors min-w-[88px] min-h-[44px]"
                [class.bg-[var(--surface-alt)]]="activeTab !== 'edit'"
                [class.text-[var(--text-muted)]]="activeTab !== 'edit'"
                [class.bg-white]="activeTab === 'edit'"
                [class.text-[var(--primary)]]="activeTab === 'edit'"
                [class.font-semibold]="activeTab === 'edit'"
              >Écrire</button>
              <button
                type="button"
                #contentTabPreview
                role="tab"
                [attr.aria-selected]="activeTab === 'preview'"
                aria-controls="review-content-preview-panel"
                id="review-tab-preview"
                [attr.tabindex]="activeTab === 'preview' ? 0 : -1"
                (click)="activeTab = 'preview'"
                (keydown)="onContentTabKeydown($event)"
                class="px-4 py-2 text-sm font-medium transition-colors min-w-[88px] min-h-[44px] border-l border-[var(--border-light)]"
                [class.bg-[var(--surface-alt)]]="activeTab !== 'preview'"
                [class.text-[var(--text-muted)]]="activeTab !== 'preview'"
                [class.bg-white]="activeTab === 'preview'"
                [class.text-[var(--primary)]]="activeTab === 'preview'"
                [class.font-semibold]="activeTab === 'preview'"
              >Aperçu</button>
            </div>

            <!-- Edit panel -->
            <div
              id="review-content-edit-panel"
              role="tabpanel"
              aria-labelledby="review-tab-edit"
              [hidden]="activeTab !== 'edit'"
            >
              <textarea
                id="content"
                formControlName="content"
                placeholder="Saisir le texte complet de la critique (Markdown supporté)"
                rows="10"
                class="w-full border border-[var(--border-light)] rounded-b-xl rounded-tr-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm font-mono"
                aria-required="true"
                [attr.aria-label]="'Contenu de la critique'"
                [attr.aria-invalid]="isFieldInvalid('content')"
              ></textarea>
            </div>

            <!-- Preview panel -->
            <div
              id="review-content-preview-panel"
              role="tabpanel"
              aria-labelledby="review-tab-preview"
              [hidden]="activeTab !== 'preview'"
              [attr.tabindex]="activeTab === 'preview' ? 0 : -1"
              class="min-h-[14rem] border border-[var(--border-light)] rounded-b-xl rounded-tr-xl px-4 py-3 bg-white prose prose-sm max-w-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <markdown
                *ngIf="reviewForm.get('content')?.value"
                [data]="reviewForm.get('content')?.value"
              ></markdown>
              <p
                *ngIf="!reviewForm.get('content')?.value"
                class="text-[var(--text-muted)] italic text-sm"
              >Aucun contenu à afficher.</p>
            </div>

            <p *ngIf="isFieldInvalid('content')" class="text-red-600 text-sm mt-1">Le contenu de la critique est requis (minimum 50 caractères)</p>
          </div>

          <!-- URL de couverture -->
          <div>
            <label for="imageUrl" class="block text-sm font-semibold mb-2 text-[var(--primary)]">URL de la couverture</label>
            <input
              id="imageUrl"
              type="url"
              formControlName="imageUrl"
              placeholder="URL de l'image (facultatif)"
              class="w-full border border-[var(--border-light)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              [attr.aria-label]="'URL de la couverture'"
            />
            <p class="text-[var(--text-muted)] text-xs mt-1">Facultatif : coller l'URL d'une image de couverture</p>
          </div>

          <!-- Statut de publication -->
          <div class="flex items-center gap-3">
            <input
              id="isPublished"
              type="checkbox"
              formControlName="isPublished"
              class="w-4 h-4 cursor-pointer"
              [attr.aria-label]="'Publier cette critique'"
            />
            <label for="isPublished" class="text-sm font-semibold cursor-pointer text-[var(--primary)]">
              Publier cette critique immédiatement
            </label>
          </div>

          <!-- Boutons -->
          <div class="flex gap-4 pt-4">
            <app-button
              [label]="isEditMode ? 'Mettre à jour' : 'Créer la critique'"
              [isLoading]="isSubmitting"
              [disabled]="!reviewForm.valid || isSubmitting"
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
export class ReviewFormComponent implements OnInit, OnDestroy, HasUnsavedChanges {
  reviewForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSubmitting = false;
  reviewId: string | null = null;

  activeTab: 'edit' | 'preview' = 'edit';

  private readonly contentTabEditRef = viewChild<ElementRef<HTMLButtonElement>>('contentTabEdit');
  private readonly contentTabPreviewRef = viewChild<ElementRef<HTMLButtonElement>>('contentTabPreview');

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService,
    private notificationService: NotificationService,
    private logger: LoggerService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private cdr: ChangeDetectorRef,
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.reviewId = params['id'];
        this.loadReview();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onContentTabKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      this.activeTab = this.activeTab === 'edit' ? 'preview' : 'edit';
      this.cdr.markForCheck();
      this.focusActiveContentTab();
    } else if (event.key === 'Home') {
      event.preventDefault();
      this.activeTab = 'edit';
      this.cdr.markForCheck();
      this.focusActiveContentTab();
    } else if (event.key === 'End') {
      event.preventDefault();
      this.activeTab = 'preview';
      this.cdr.markForCheck();
      this.focusActiveContentTab();
    }
  }

  private focusActiveContentTab(): void {
    queueMicrotask(() => {
      const el =
        this.activeTab === 'edit'
          ? this.contentTabEditRef()?.nativeElement
          : this.contentTabPreviewRef()?.nativeElement;
      el?.focus();
    });
  }

  /**
   * Initialize form with validation
   */
  private initializeForm(): void {
    this.reviewForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      bookTitle: ['', [Validators.required, Validators.minLength(2)]],
      bookAuthor: ['', [Validators.required, Validators.minLength(2)]],
      genre: ['', Validators.required],
      rating: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      content: ['', [Validators.required, Validators.minLength(50)]],
      imageUrl: [''],
      isPublished: [false],
    });
  }

  /**
   * Load review for editing
   */
  private loadReview(): void {
    if (!this.reviewId) return;

    this.isLoading = true;
    this.reviewService
      .getReviewById(this.reviewId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (review) => {
          this.reviewForm.patchValue(review);
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.notificationService.error('Impossible de charger la critique');
          this.logger.error('Error loading review:', error, { reviewId: this.reviewId });
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  /**
   * Returns true when the form has unsaved changes (dirty and not submitted).
   * Used by canDeactivateGuard to warn before navigation.
   */
  hasUnsavedChanges(): boolean {
    return this.reviewForm?.dirty ?? false;
  }

  /**
   * Check if form field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.reviewForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Submit form
   */
  onSubmit(): void {
    if (!this.reviewForm.valid) {
      this.notificationService.warning('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isSubmitting = true;
    const formData = this.reviewForm.value;

    const request = this.isEditMode
      ? this.reviewService.updateReview(this.reviewId!, formData)
      : this.reviewService.createReview(formData);

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: (review) => {
        this.notificationService.success(
          this.isEditMode ? 'Critique mise à jour avec succès' : 'Critique enregistrée avec succès',
        );
        this.reviewForm.markAsPristine();
        this.isSubmitting = false;
        this.cdr.markForCheck();
        // Defer navigation so the root toast can render before the route changes.
        setTimeout(() => {
          this.router.navigate(['/reviews', review.id]);
        }, 0);
      },
      error: (error) => {
        this.notificationService.error('Impossible d\'enregistrer la critique');
        this.logger.error('Error saving review:', error);
        this.isSubmitting = false;
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * Cancel and go back to the previous page, with a fallback to home.
   */
  onCancel(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  /** Breadcrumb trail for create vs edit review form. */
  reviewFormBreadcrumbs(): BreadcrumbItem[] {
    const root: BreadcrumbItem[] = [
      { label: 'Accueil', routerLink: ['/'] },
      { label: 'Critiques', routerLink: ['/reviews'] },
    ];
    if (!this.isEditMode) {
      return [...root, { label: 'Nouvelle critique' }];
    }
    const rawTitle = this.reviewForm?.get('title')?.value as string | undefined;
    const title = rawTitle?.trim();
    const displayTitle = title && title.length > 0 ? title : 'Critique';
    if (this.reviewId) {
      return [...root, { label: displayTitle, routerLink: ['/reviews', this.reviewId] }, { label: 'Modifier' }];
    }
    return [...root, { label: 'Modifier' }];
  }
}
