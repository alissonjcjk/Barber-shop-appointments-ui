import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CalendarDay, AppointmentRow } from '../schedules-month.models';

@Component({
  selector: 'app-schedule-day-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './schedule-day-cell.component.html',
  styleUrl:    './schedule-day-cell.component.scss',
})
export class ScheduleDayCellComponent {
  @Input({ required: true }) day!: CalendarDay;
  @Input() isDeletingId: number | null = null;

  /** Emits the appointment id to be deleted */
  @Output() deleteSchedule = new EventEmitter<number>();

  /** Emits the day date when user clicks "new appointment" on this cell */
  @Output() newSchedule = new EventEmitter<Date>();

  readonly MAX_VISIBLE = 3;

  get visibleApts(): AppointmentRow[] {
    return this.day.appointments.slice(0, this.MAX_VISIBLE);
  }

  get hiddenCount(): number {
    return Math.max(0, this.day.appointments.length - this.MAX_VISIBLE);
  }

  onNewSchedule(event: MouseEvent): void {
    event.stopPropagation();
    this.newSchedule.emit(this.day.date);
  }

  onDelete(event: MouseEvent, id: number): void {
    event.stopPropagation();
    this.deleteSchedule.emit(id);
  }

  isDeleting(id: number): boolean {
    return this.isDeletingId === id;
  }
}
