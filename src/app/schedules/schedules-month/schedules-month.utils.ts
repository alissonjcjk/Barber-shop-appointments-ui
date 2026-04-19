// ─────────────────────────────────────────────────────────────────────────────
// Schedules Month — Pure Utility Functions (no Angular deps, easy to test)
// ─────────────────────────────────────────────────────────────────────────────

import { AppointmentRow, CalendarDay } from './schedules-month.models';
import { ScheduledAppointmentItemResponse } from '../../services/api-client/schedules/schedule.models';

/** Map API response item → view-model row */
export function toAppointmentRow(apt: ScheduledAppointmentItemResponse): AppointmentRow {
  return {
    id:         apt.id,
    clientId:   apt.clientId,
    clientName: apt.clientName,
    startTime:  formatTime(new Date(apt.startAt)),
    endTime:    formatTime(new Date(apt.endAt)),
  };
}

/** Format a Date to "HH:mm" */
export function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Build a 42-cell grid (6 rows × 7 cols) for a given year/month.
 * Cells outside the current month are marked with `isCurrentMonth: false`.
 */
export function buildCalendarGrid(
  year: number,
  month: number,                                // 1-based
  appointments: ScheduledAppointmentItemResponse[]
): CalendarDay[] {
  const today      = new Date();
  const firstDay   = new Date(year, month - 1, 1);
  const totalDays  = new Date(year, month, 0).getDate();

  // Weekday of the 1st (0=Sun) — we want Mon as col-0
  let startOffset = firstDay.getDay(); // 0=Sun
  startOffset = startOffset === 0 ? 6 : startOffset - 1; // shift so Mon=0

  // Group appointments by day-of-month
  const aptsMap = new Map<number, AppointmentRow[]>();
  for (const apt of appointments) {
    const d = new Date(apt.startAt).getDate();
    if (!aptsMap.has(d)) aptsMap.set(d, []);
    aptsMap.get(d)!.push(toAppointmentRow(apt));
  }

  // Sort appointments within each day by start time
  aptsMap.forEach(rows =>
    rows.sort((a, b) => a.startTime.localeCompare(b.startTime))
  );

  const cells: CalendarDay[] = [];
  const totalCells = 42;

  for (let i = 0; i < totalCells; i++) {
    const dayOffset = i - startOffset + 1;

    if (dayOffset < 1 || dayOffset > totalDays) {
      // Day from adjacent month — compute real date
      const date = new Date(year, month - 1, dayOffset);
      cells.push({
        date,
        day:            date.getDate(),
        isCurrentMonth: false,
        isToday:        false,
        appointments:   [],
      });
    } else {
      const date = new Date(year, month - 1, dayOffset);
      cells.push({
        date,
        day:            dayOffset,
        isCurrentMonth: true,
        isToday:        isSameDay(date, today),
        appointments:   aptsMap.get(dayOffset) ?? [],
      });
    }
  }

  return cells;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

/** Return the Portuguese month name */
export function ptMonthName(month: number): string {
  const names = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
  ];
  return names[(month - 1 + 12) % 12];
}

/** Build a local datetime string for <input type="datetime-local"> */
export function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
