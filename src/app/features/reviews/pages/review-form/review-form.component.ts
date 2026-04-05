import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ReviewService } from '../../services/review.service';
import { NotificationService } from '@core/services/notification.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
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
  ],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold mb-8">
        {{ isEditMode ? 'Edit Review' : 'Create New Review' }}
      </h1>

      <div class="max-w-2xl bg-white rounded-lg shadow-lg p-8">
        <form *ngIf="reviewForm" [formGroup]="reviewForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Title -->
          <div>
            <label for="title" class="block text-sm font-semibold mb-2">Review Title *</label>
            <input
              id="title"
              type="text"
              formControlName="title"
              placeholder="Enter review title"
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              [attr.aria-label]="'Review Title'"
              [attr.aria-invalid]="isFieldInvalid('title')"
            />
            <p *ngIf="isFieldInvalid('title')" class="text-red-600 text-sm mt-1">Title is required</p>
          </div>

          <!-- Book Title -->
          <div>
            <label for="bookTitle" class="block text-sm font-semibold mb-2">Book Title *</label>
            <input
              id="bookTitle"
              type="text"
              formControlName="bookTitle"
              placeholder="Enter book title"
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              [attr.aria-label]="'Book Title'"
              [attr.aria-invalid]="isFieldInvalid('bookTitle')"
            />
            <p *ngIf="isFieldInvalid('bookTitle')" class="text-red-600 text-sm mt-1">Book title is required</p>
          </div>

          <!-- Book Author -->
          <div>
            <label for="bookAuthor" class="block text-sm font-semibold mb-2">Book Author *</label>
            <input
              id="bookAuthor"
              type="text"
              formControlName="bookAuthor"
              placeholder="Enter book author"
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              [attr.aria-label]="'Book Author'"
              [attr.aria-invalid]="isFieldInvalid('bookAuthor')"
            />
            <p *ngIf="isFieldInvalid('bookAuthor')" class="text-red-600 text-sm mt-1">Book author is required</p>
          </div>

          <!-- Genre -->
          <div>
            <label for="genre" class="block text-sm font-semibold mb-2">Genre *</label>
            <select
              id="genre"
              formControlName="genre"
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              [attr.aria-label]="'Genre'"
              [attr.aria-invalid]="isFieldInvalid('genre')"
            >
              <option value="">Select a genre</option>
              <option value="fiction">Fiction</option>
              <option value="non-fiction">Non-Fiction</option>
              <option value="mystery">Mystery</option>
              <option value="romance">Romance</option>
              <option value="science-fiction">Science Fiction</option>
              <option value="fantasy">Fantasy</option>
              <option value="biography">Biography</option>
              <option value="history">History</option>
              <option value="self-help">Self-Help</option>
              <option value="other">Other</option>
            </select>
            <p *ngIf="isFieldInvalid('genre')" class="text-red-600 text-sm mt-1">Genre is required</p>
          </div>

          <!-- Rating -->
          <div>
            <label for="rating" class="block text-sm font-semibold mb-2">Rating (1-5) *</label>
            <input
              id="rating"
              type="number"
              formControlName="rating"
              min="1"
              max="5"
              placeholder="Enter rating"
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              [attr.aria-label]="'Rating'"
              [attr.aria-invalid]="isFieldInvalid('rating')"
            />
            <p *ngIf="isFieldInvalid('rating')" class="text-red-600 text-sm mt-1">
              Rating must be between 1 and 5
            </p>
          </div>

          <!-- Description (Short Summary) -->
          <div>
            <label for="description" class="block text-sm font-semibold mb-2">Description *</label>
            <textarea
              id="description"
              formControlName="description"
              placeholder="Enter a short description (max 300 characters)"
              rows="3"
              maxlength="300"
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              [attr.aria-label]="'Description'"
              [attr.aria-invalid]="isFieldInvalid('description')"
            ></textarea>
            <p *ngIf="isFieldInvalid('description')" class="text-red-600 text-sm mt-1">
              Description is required
            </p>
            <p class="text-gray-500 text-xs mt-1">
              {{ reviewForm.get('description')?.value?.length || 0 }}/300 characters
            </p>
          </div>

          <!-- Content (Full Review) -->
          <div>
            <label for="content" class="block text-sm font-semibold mb-2">Full Review *</label>
            <textarea
              id="content"
              formControlName="content"
              placeholder="Enter the full review content"
              rows="10"
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-mono text-sm"
              [attr.aria-label]="'Review Content'"
              [attr.aria-invalid]="isFieldInvalid('content')"
            ></textarea>
            <p *ngIf="isFieldInvalid('content')" class="text-red-600 text-sm mt-1">Review content is required</p>
          </div>

          <!-- Image URL -->
          <div>
            <label for="imageUrl" class="block text-sm font-semibold mb-2">Book Cover Image URL</label>
            <input
              id="imageUrl"
              type="url"
              formControlName="imageUrl"
              placeholder="Enter image URL (optional)"
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              [attr.aria-label]="'Image URL'"
            />
            <p class="text-gray-500 text-xs mt-1">Optional: Paste a URL to a book cover image</p>
          </div>

          <!-- Published Status -->
          <div class="flex items-center gap-3">
            <input
              id="isPublished"
              type="checkbox"
              formControlName="isPublished"
              class="w-4 h-4 cursor-pointer"
              [attr.aria-label]="'Publish this review'"
            />
            <label for="isPublished" class="text-sm font-semibold cursor-pointer">
              Publish this review immediately
            </label>
          </div>

          <!-- Buttons -->
          <div class="flex gap-4 pt-4">
            <app-button
              [label]="isEditMode ? 'Update Review' : 'Create Review'"
              [isLoading]="isSubmitting"
              [disabled]="!reviewForm.valid || isSubmitting"
              (onClick)="onSubmit()"
            ></app-button>
            <app-button
              label="Cancel"
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
    private route: ActivatedRoute
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
          this.notificationService.error('Failed to load review');
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
      this.notificationService.warning('Please fill out all required fields');
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
          this.isEditMode ? 'Review updated successfully' : 'Review created successfully'
        );
        this.isSubmitting = false;
        this.router.navigate(['/reviews', review.id]);
      },
      error: (error) => {
        this.notificationService.error('Failed to save review');
        console.error('Error saving review:', error);
        this.isSubmitting = false;
      },
    });
  }

  /**
   * Cancel and go back
   */
  onCancel(): void {
    this.router.navigate(['/']);
  }
}
