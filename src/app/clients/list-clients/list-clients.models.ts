// ─── Sort ──────────────────────────────────────────────────────────────────
export type SortField     = 'name' | 'email' | 'phone';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
  field:     SortField;
  direction: SortDirection;
}

// ─── View models ──────────────────────────────────────────────────────────
// NOTE: Properties are declared inline (not via extends) to avoid circular
// imports between the models file and the service layer.
export interface ClientRow {
  id:             number;
  name:           string;
  email:          string;
  phone:          string;
  formattedPhone: string;
  initials:       string;
}
