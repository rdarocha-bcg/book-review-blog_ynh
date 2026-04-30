import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import { NotificationService } from '@core/services/notification.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { StarRatingInputComponent } from '@shared/components/star-rating-input/star-rating-input.component';
import { Subject, takeUntil } from 'rxjs';

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
  ],
  template: `
    <div class="page-container">
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

          <!-- Contenu complet -->
          <div>
            <label for="content" class="block text-sm font-semibold mb-2 text-[var(--primary)]">Critique complète *</label>
            <textarea
              id="content"
              formControlName="content"
              placeholder="Saisir le texte complet de la critique"
              rows="10"
              class="w-full border border-[var(--border-light)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm"
              [attr.aria-label]="'Contenu de la critique'"
              [attr.aria-invalid]="isFieldInvalid('content')"
            ></textarea>
            <p *ngIf="isFieldInvalid('content')" class="text-red-600 text-sm mt-1">Le contenu de la critique est requis</p>
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
export class ReviewFormComponent implements OnInit, OnDestroy {
  reviewForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSubmitting = false;
  reviewId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
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
        },
        error: (error) => {
          this.notificationService.error('Impossible de charger la critique');
          console.error('Error loading review:', error);
          this.isLoading = false;
        },
      });
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
          this.isEditMode ? 'Critique mise à jour avec succès' : 'Critique créée avec succès'
        );
        this.isSubmitting = false;
        this.router.navigate(['/reviews', review.id]);
      },
      error: (error) => {
        this.notificationService.error('Impossible d\'enregistrer la critique');
        console.error('Error saving review:', error);
        this.isSubmitting = false;
      },
    });
  }

  /**
   * Cancel and go back to the previous page
   */
  onCancel(): void {
    this.location.back();
  }
}
