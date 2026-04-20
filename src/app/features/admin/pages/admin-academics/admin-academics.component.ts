import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AcademicService } from '../../../academics/services/academic.service';
import { NotificationService } from '@core/services/notification.service';
import { LoadingSpinnerComponent } from '@shared/components/loading-spinner/loading-spinner.component';
import { Subject, takeUntil } from 'rxjs';
import { AcademicWork } from '../../../academics/models/academic.model';

@Component({
  selector: 'app-admin-academics',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingSpinnerComponent],
  template: `
    <div class="page-container page-container--tight-y">
      <div class="mb-8">
        <a routerLink="/admin" class="text-[var(--accent-strong)] hover:text-[var(--primary)] mb-2 inline-block font-semibold">← Retour au tableau de bord</a>
        <h1 class="text-4xl font-bold text-[var(--primary)]">Travaux Académiques</h1>
        <p class="text-[var(--text-muted)] mt-1">Gérer tous les travaux académiques.</p>
      </div>

      <div class="mb-4">
        <a
          routerLink="/academics/new"
          class="inline-block px-4 py-2 rounded-lg bg-[var(--accent-strong)] text-white font-semibold hover:brightness-90 transition"
        >+ Nouvel académique</a>
      </div>

      <app-loading-spinner *ngIf="loading"></app-loading-spinner>

      <div *ngIf="!loading" class="space-y-4">
        <div
          *ngFor="let academic of academics; trackBy: trackById"
          class="bg-[var(--card-bg)] rounded-lg border border-[var(--border-light)] p-6"
        >
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 class="text-xl font-semibold text-[var(--primary)]">{{ academic.title }}</h2>
              <p class="text-sm text-[var(--text-muted)]">{{ academic.workType }} · {{ academic.year }} · {{ academic.theme }}</p>
              <p class="text-sm text-[var(--text-dark)] mt-1 line-clamp-2">{{ academic.summary }}</p>
              <span
                class="mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
                [class.bg-green-100]="academic.isPublished"
                [class.text-green-700]="academic.isPublished"
                [class.bg-yellow-100]="!academic.isPublished"
                [class.text-yellow-700]="!academic.isPublished"
              >{{ academic.isPublished ? 'Publié' : 'Non publié' }}</span>
            </div>
            <div class="flex gap-2 flex-shrink-0">
              <button
                type="button"
                (click)="togglePublish(academic)"
                class="px-4 py-2 rounded font-medium transition"
                [class.bg-yellow-100]="academic.isPublished"
                [class.text-yellow-800]="academic.isPublished"
                [class.hover:bg-yellow-200]="academic.isPublished"
                [class.bg-green-100]="!academic.isPublished"
                [class.text-green-800]="!academic.isPublished"
                [class.hover:bg-green-200]="!academic.isPublished"
                [attr.aria-label]="(academic.isPublished ? 'Dépublier ' : 'Publier ') + academic.title"
              >{{ academic.isPublished ? 'Dépublier' : 'Publier' }}</button>
              <a
                [routerLink]="['/academics', academic.id, 'edit']"
                class="px-4 py-2 bg-[var(--surface-alt)] text-[var(--primary)] rounded font-medium hover:brightness-95 transition inline-block"
              >Modifier</a>
              <button
                type="button"
                (click)="deleteAcademic(academic)"
                class="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition"
                [attr.aria-label]="'Supprimer ' + academic.title"
              >Supprimer</button>
            </div>
          </div>
        </div>
        <p *ngIf="academics.length === 0" class="text-center text-[var(--text-muted)] py-8">Aucun travail académique trouvé.</p>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAcademicsComponent implements OnInit, OnDestroy {
  academics: AcademicWork[] = [];
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private academicService: AcademicService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAcademics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAcademics(): void {
    this.loading = true;
    this.academicService
      .getAcademics({ limit: 100 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.academics = res.data || [];
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.notificationService.error('Impossible de charger les travaux académiques');
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  togglePublish(academic: AcademicWork): void {
    this.academicService
      .updateAcademic(academic.id, { isPublished: !academic.isPublished })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success(
            academic.isPublished ? 'Travail dépublié.' : 'Travail publié.'
          );
          this.loadAcademics();
        },
        error: () => this.notificationService.error('Impossible de modifier la publication.'),
      });
  }

  deleteAcademic(academic: AcademicWork): void {
    if (!confirm(`Supprimer "${academic.title}" ?`)) return;
    this.academicService
      .deleteAcademic(academic.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notificationService.success('Travail académique supprimé.');
          this.loadAcademics();
        },
        error: () => this.notificationService.error('Impossible de supprimer le travail.'),
      });
  }

  trackById(_index: number, academic: AcademicWork): string {
    return academic.id;
  }
}
