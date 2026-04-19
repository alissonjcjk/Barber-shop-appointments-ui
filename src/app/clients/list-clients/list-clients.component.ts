import {
  Component, Inject, OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription, debounceTime, Subject } from 'rxjs';

import { ICLientService } from '../../services/api-client/clients/iclients.service';
import { ISnackbarManagerService } from '../../services/isnackbar-manager.service';
import { IDialogManagerService } from '../../services/idialog-manager.service';
import { SERVICES_TOKEN } from '../../services/service.token';
import { YesNoDialogComponent } from '../../commons/components/yes-no-dialog/yes-no-dialog.component';

import { ClientRow, SortField, SortState } from './list-clients.models';
import {
  toClientRow, filterClients, sortClients, toggleSort
} from './list-clients.utils';
import { ClientRowComponent } from './client-row/client-row.component';

@Component({
  selector: 'app-list-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule, ClientRowComponent],
  templateUrl: './list-clients.component.html',
  styleUrl:    './list-clients.component.scss',
})
export class ListClientsComponent implements OnInit, OnDestroy {

  // States
  isLoading    = true;
  deletingId: number | null = null;

  // Data
  private allRows: ClientRow[] = [];
  visibleRows: ClientRow[]     = [];

  // Search
  searchQuery    = '';
  private search$ = new Subject<string>();

  // Sort
  sort: SortState = { field: 'name', direction: 'asc' };

  // Stats
  get totalCount():    number { return this.allRows.length; }
  get filteredCount(): number { return this.visibleRows.length; }
  get isFiltering():   boolean { return this.searchQuery.trim().length > 0; }

  private subs = new Subscription();

  constructor(
    private readonly router: Router,
    @Inject(SERVICES_TOKEN.HTTP.CLIENT)  private readonly clientService: ICLientService,
    @Inject(SERVICES_TOKEN.SNACKBAR)     private readonly snackbar: ISnackbarManagerService,
    @Inject(SERVICES_TOKEN.DIALOG)       private readonly dialog: IDialogManagerService,
  ) {}

  ngOnInit(): void {
    this.setupSearch();
    this.loadClients();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ── Data ────────────────────────────────────────────────────────────────────

  loadClients(): void {
    this.isLoading = true;
    this.clientService.list().subscribe({
      next: (list) => {
        this.allRows   = list.map(toClientRow);
        this.isLoading = false;
        this.applyFilters();
      },
      error: () => {
        this.isLoading = false;
        this.snackbar.showError('Erro ao carregar a lista de clientes.');
      },
    });
  }

  // ── Search ───────────────────────────────────────────────────────────────────

  private setupSearch(): void {
    this.subs.add(
      this.search$.pipe(debounceTime(250)).subscribe(() => {
        this.applyFilters();
      })
    );
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.search$.next(query);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  // ── Sort ──────────────────────────────────────────────────────────────────────

  onSort(field: SortField): void {
    this.sort = toggleSort(this.sort, field);
    this.applyFilters();
  }

  sortIcon(field: SortField): string {
    if (this.sort.field !== field) return 'unfold_more';
    return this.sort.direction === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  // ── Filter + Sort Pipeline ───────────────────────────────────────────────────

  private applyFilters(): void {
    const filtered = filterClients(this.allRows, this.searchQuery);
    this.visibleRows = sortClients(filtered, this.sort);
  }

  // ── Navigation ───────────────────────────────────────────────────────────────

  navigateToNew():  void { this.router.navigate(['clients/new-client']); }
  navigateToEdit(id: number): void { this.router.navigate(['clients/edit-client', id]); }

  // ── Delete ───────────────────────────────────────────────────────────────────

  onDelete(id: number): void {
    const client = this.allRows.find(c => c.id === id);

    this.subs.add(
      this.dialog.showYesNoDialog(YesNoDialogComponent, {
        title:   'Excluir cliente',
        content: `Tem certeza que deseja excluir <strong>${client?.name ?? 'este cliente'}</strong>? Esta ação não pode ser desfeita.`,
      }).subscribe(confirmed => {
        if (confirmed) this.deleteClient(id);
      })
    );
  }

  private deleteClient(id: number): void {
    this.deletingId = id;
    this.clientService.delete(id).subscribe({
      next: () => {
        this.allRows    = this.allRows.filter(c => c.id !== id);
        this.deletingId = null;
        this.applyFilters();
        this.snackbar.showSuccess('Cliente excluído com sucesso!');
      },
      error: () => {
        this.deletingId = null;
        this.snackbar.showError('Erro ao excluir cliente. Tente novamente.');
      },
    });
  }

  // ── Track ─────────────────────────────────────────────────────────────────────

  trackById(_: number, row: ClientRow): number { return row.id; }
}
