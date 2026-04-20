import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AcademicService } from '../../services/academic.service';
import { NotificationService } from '@core/services/notification.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-academic-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    LoadingSpinnerComponent,
  ],
  template: `
    <div class="page-container">
      <h1 class="text-4xl md:text-5xl font-bold mb-8 text-[var(--primary)]">
        {{ isEditMode ? 'Modifier le travail académique' : 'Nouveau travail académique' }}
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
            <p *ngIf="isFieldInvalid('summary')" class="text-red-600 text-sm mt-1">Le résumé est requis</p>
          </div>

          <!-- Contenu -->
          <div>
            <label for="content" class="block text-sm font-semibold mb-2 text-[var(--primary)]">Contenu</label>
            <textarea
              id="content"
              formControlName="content"
              placeholder="Contenu complet du travail"
              rows="10"
              class="w-full border border-[var(--border-light)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm"
            ></textarea>
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
              <option value="mémoire">Mémoire</option>
              <option value="thèse">Thèse</option>
              <option value="article">Article</option>
              <option value="essai">Essai</option>
              <option value="rapport">Rapport</option>
              <option value="autre">Autre</option>
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

          <!-- Extrait -->
          <div>
            <label for="excerpt" class="block text-sm font-semibold mb-2 text-[var(--primary)]">Extrait</label>
            <textarea
              id="excerpt"
              formControlName="excerpt"
              placeholder="Extrait du travail (optionnel)"
              rows="3"
              class="w-full border border-[var(--border-light)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            ></textarea>
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

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private academicService: AcademicService,
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
      summary: ['', [Validators.required]],
      content: [''],
      imageUrl: [''],
      workType: ['', Validators.required],
      context: [''],
      year: [new Date().getFullYear()],
      theme: [''],
      excerpt: [''],
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
          this.academicForm.patchValue(academic);
          this.isLoading = false;
        },
        error: (error) => {
          this.notificationService.error('Impossible de charger le travail académique');
          console.error('Error loading academic:', error);
          this.isLoading = false;
        },
      });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.academicForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
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
    this.router.navigate(['/academics']);
  }
}
