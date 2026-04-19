// ─────────────────────────────────────────────────────────────────────────────
// Schedules Month — View-Layer Models
// ─────────────────────────────────────────────────────────────────────────────

/** Single appointment row displayed inside a calendar cell */
export interface AppointmentRow {
  id:         number;
  clientId:   number;
  clientName: string;
  startTime:  string;   // "HH:mm"
  endTime:    string;   // "HH:mm"
}

/** One cell of the calendar grid (may belong to current or adjacent month) */
export interface CalendarDay {
  date:           Date;
  day:            number;
  isCurrentMonth: boolean;
  isToday:        boolean;
  appointments:   AppointmentRow[];
}

/** Lightweight client item for the "select client" dropdown */
export interface ClientOption {
  id:   number;
  name: string;
}

/** Form data for the new-schedule dialog */
export interface NewScheduleFormData {
  preselectedDate: Date | null;
  clients:         ClientOption[];
}
