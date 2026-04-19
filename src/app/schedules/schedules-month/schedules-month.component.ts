import {
  Component, Inject, OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { SERVICES_TOKEN } from '../../services/service.token';
import { IScheduleService } from '../../services/api-client/schedules/ischedules.service';
import { ICLientService } from '../../services/api-client/clients/iclients.service';
import { ISnackbarManagerService } from '../../services/isnackbar-manager.service';
import { IDialogManagerService } from '../../services/idialog-manager.service';
import { YesNoDialogComponent } from '../../commons/components/yes-no-dialog/yes-no-dialog.component';

import { CalendarDay, ClientOption, NewScheduleFormData } from './schedules-month.models';
import { buildCalendarGrid, ptMonthName } from './schedules-month.utils';
import { ScheduleDayCellComponent } from './schedule-day-cell/schedule-day-cell.component';
import { NewScheduleDialogComponent } from './new-schedule-dialog/new-schedule-dialog.component';

@Component({
  selector: 'app-schedules-month',
  standalone: true,
  imports: [CommonModule, MatTooltipModule, ScheduleDayCellComponent],
  templateUrl: './schedules-month.component.html',
  styleUrl:    './schedules-month.component.scss',
})
export class SchedulesMonthComponent implements OnInit, OnDestroy {

  // ── Navigation ─────────────────────────────────────────────────────────────
  currentYear:  number;
  currentMonth: number; // 1-based

  // ── State ──────────────────────────────────────────────────────────────────
  isLoading  = true;
  calendarDays: CalendarDay[] = [];
  clients: ClientOption[]     = [];
  deletingId: number | null   = null;

  // ── Labels ─────────────────────────────────────────────────────────────────
  readonly weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  get monthLabel(): string {
    return `${ptMonthName(this.currentMonth)} ${this.currentYear}`;
  }

  get totalAppointments(): number {
    return this.calendarDays.reduce((sum, d) => sum + d.appointments.length, 0);
  }

  private subs = new Subscription();

  constructor(
    @Inject(SERVICES_TOKEN.HTTP.SCHEDULE) private readonly scheduleService: IScheduleService,
    @Inject(SERVICES_TOKEN.HTTP.CLIENT)   private readonly clientService: ICLientService,
    @Inject(SERVICES_TOKEN.SNACKBAR)      private readonly snackbar: ISnackbarManagerService,
    @Inject(SERVICES_TOKEN.DIALOG)        private readonly dialog: IDialogManagerService,
    private readonly matDialog: MatDialog,
  ) {
    const now       = new Date();
    this.currentYear  = now.getFullYear();
    this.currentMonth = now.getMonth() + 1;
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadMonth();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ── Data Loading ───────────────────────────────────────────────────────────

  private loadClients(): void {
    this.subs.add(
      this.clientService.list().subscribe({
        next: (list) => {
          this.clients = list.map(c => ({ id: c.id, name: c.name }));
        },
        error: () => {
          this.snackbar.showError('Não foi possível carregar a lista de clientes.');
        },
      })
    );
  }

  loadMonth(): void {
    this.isLoading = true;
    this.calendarDays = [];

    this.subs.add(
      this.scheduleService.listInMonth(this.currentYear, this.currentMonth).subscribe({
        next: (resp) => {
          this.calendarDays = buildCalendarGrid(
            this.currentYear,
            this.currentMonth,
            resp.scheduledAppointments as any
          );
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.snackbar.showError('Erro ao carregar os agendamentos do mês.');
        },
      })
    );
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  prevMonth(): void {
    if (this.currentMonth === 1) {
      this.currentMonth = 12;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.loadMonth();
  }

  nextMonth(): void {
    if (this.currentMonth === 12) {
      this.currentMonth = 1;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.loadMonth();
  }

  goToToday(): void {
    const now = new Date();
    this.currentYear  = now.getFullYear();
    this.currentMonth = now.getMonth() + 1;
    this.loadMonth();
  }

  // ── New Schedule ───────────────────────────────────────────────────────────

  onNewSchedule(preselectedDate: Date | null = null): void {
    const data: NewScheduleFormData = {
      preselectedDate,
      clients: this.clients,
    };

    const ref = this.matDialog.open(NewScheduleDialogComponent, {
      width: '480px',
      maxWidth: '96vw',
      panelClass: 'dev-dialog-transparent',
      data,
    });

    this.subs.add(
      ref.afterClosed().subscribe(result => {
        if (result) {
          this.loadMonth();
        }
      })
    );
  }

  // ── Delete Schedule ────────────────────────────────────────────────────────

  onDeleteSchedule(id: number): void {
    // Find which client name this appointment belongs to
    let clientName = 'este agendamento';
    for (const day of this.calendarDays) {
      const apt = day.appointments.find(a => a.id === id);
      if (apt) { clientName = apt.clientName; break; }
    }

    this.subs.add(
      this.dialog.showYesNoDialog(YesNoDialogComponent, {
        title:   'Cancelar agendamento',
        content: `Tem certeza que deseja cancelar o agendamento de <strong>${clientName}</strong>? Esta ação não pode ser desfeita.`,
      }).subscribe(confirmed => {
        if (confirmed) this.deleteSchedule(id);
      })
    );
  }

  private deleteSchedule(id: number): void {
    this.deletingId = id;

    this.subs.add(
      this.scheduleService.delete(id).subscribe({
        next: () => {
          this.deletingId = null;
          this.snackbar.showSuccess('Agendamento cancelado com sucesso!');
          this.loadMonth();
        },
        error: () => {
          this.deletingId = null;
          this.snackbar.showError('Erro ao cancelar agendamento. Tente novamente.');
        },
      })
    );
  }

  // ── Track ──────────────────────────────────────────────────────────────────

  trackByDay(_: number, day: CalendarDay): number {
    return day.date.getTime();
  }
}
