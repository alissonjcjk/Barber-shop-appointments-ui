import { ClientRow, SortField, SortDirection, SortState } from './list-clients.models';
import { ListClientResponse } from '../../services/api-client/clients/client.models';

// ─────────────────────────────────────────────────────────────────────────────
// Pure helpers — no Angular dependencies, easy to unit-test
// ─────────────────────────────────────────────────────────────────────────────

export function toClientRow(c: ListClientResponse): ClientRow {
  return {
    ...c,
    formattedPhone: formatPhone(c.phone),
    initials:       getInitials(c.name),
  };
}

export function getInitials(name: string): string {
  const parts = (name ?? '').trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatPhone(phone: string): string {
  const d = (phone ?? '').replace(/\D/g, '');
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return phone;
}

export function filterClients(rows: ClientRow[], query: string): ClientRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter(r =>
    r.name.toLowerCase().includes(q) ||
    r.email.toLowerCase().includes(q) ||
    r.formattedPhone.includes(q)
  );
}

export function sortClients(rows: ClientRow[], sort: SortState): ClientRow[] {
  return [...rows].sort((a, b) => {
    const valA = (a[sort.field] ?? '').toLowerCase();
    const valB = (b[sort.field] ?? '').toLowerCase();
    const cmp  = valA.localeCompare(valB, 'pt-BR');
    return sort.direction === 'asc' ? cmp : -cmp;
  });
}

export function toggleSort(current: SortState, field: SortField): SortState {
  if (current.field === field) {
    return { field, direction: current.direction === 'asc' ? 'desc' : 'asc' };
  }
  return { field, direction: 'asc' };
}
