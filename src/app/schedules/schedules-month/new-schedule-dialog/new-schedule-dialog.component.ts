import {
  Component, Inject, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { SERVICES_TOKEN } from '../../../services/service.token';
import { IScheduleService } from '../../../services/api-client/schedules/ischedules.service';
import { ISnackbarManagerService } from '../../../services/isnackbar-manager.service';
import { ClientOption, NewScheduleFormData } from '../schedules-month.models';
import { toDatetimeLocal } from '../schedules-month.utils';

@Component({
  selector: 'app-new-schedule-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './new-schedule-dialog.component.html',
  styleUrl:    './new-schedule-dialog.component.scss',
})
export class NewScheduleDialogComponent implements OnInit, OnDestroy {

  // Form fields (bound via ngModel)
  clientId:  number | null = null;
  startAt:   string = '';
  endAt:     string = '';

  isSaving = false;
  clients: ClientOption[] = [];

  private subs = new Subscription();

  constructor(
    private readonly dialogRef: MatDialogRef<NewScheduleDialogComponent>,
    @Inject(MAT_DIALOG_DATA)                    readonly data: NewScheduleFormData,
    @Inject(SERVICES_TOKEN.HTTP.SCHEDULE)       private readonly scheduleService: IScheduleService,
    @Inject(SERVICES_TOKEN.SNACKBAR)            private readonly snackbar: ISnackbarManagerService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.clients = this.data.clients ?? [];

    if (this.data.preselectedDate) {
      // Pre-fill start at 09:00 and end at 09:30 on the selected day
      const start = new Date(this.data.preselectedDate);
      start.setHours(9, 0, 0, 0);
      const end = new Date(start);
      end.setMinutes(30);
      this.startAt = toDatetimeLocal(start);
      this.endAt   = toDatetimeLocal(end);
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  get isFormValid(): boolean {
    return !!this.clientId && !!this.startAt && !!this.endAt && this.startAt < this.endAt;
  }

  onStartChange(): void {
    if (this.startAt && !this.endAt) {
      const end = new Date(this.startAt);
      end.setMinutes(end.getMinutes() + 30);
      this.endAt = toDatetimeLocal(end);
    }
  }

  onSave(): void {
    if (!this.isFormValid || this.isSaving) return;

    this.isSaving = true;
    this.cdr.markForCheck();

    const request = {
      startAt:  new Date(this.startAt),
      endAt:    new Date(this.endAt),
      clientId: this.clientId!,
    };

    this.subs.add(
      this.scheduleService.save(request).subscribe({
        next: (response) => {
          this.isSaving = false;
          this.snackbar.showSuccess('Agendamento criado com sucesso!');
          this.dialogRef.close(response);
        },
        error: () => {
          this.isSaving = false;
          this.cdr.markForCheck();
          this.snackbar.showError('Erro ao criar agendamento. Verifique os dados e tente novamente.');
        },
      })
    );
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
