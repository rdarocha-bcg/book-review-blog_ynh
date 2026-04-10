import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { StarRatingInputComponent } from './star-rating-input.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, StarRatingInputComponent],
  template: `
    <form [formGroup]="form">
      <app-star-rating-input formControlName="rating" labelledBy="rl"></app-star-rating-input>
    </form>
  `,
})
class HostComponent {
  readonly form = new FormGroup({
    rating: new FormControl<number>(3, { nonNullable: true }),
  });
}

describe('StarRatingInputComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should sync value from FormControl', () => {
    host.form.controls.rating.setValue(5);
    fixture.detectChanges();
    const checked = fixture.nativeElement.querySelectorAll('[role="radio"][aria-checked="true"]');
    expect(checked.length).toBe(1);
    expect(checked[0].getAttribute('aria-label')).toContain('5');
  });

  it('should update FormControl when a star is clicked', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button[role="radio"]');
    (buttons[1] as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(host.form.controls.rating.value).toBe(2);
  });
});
