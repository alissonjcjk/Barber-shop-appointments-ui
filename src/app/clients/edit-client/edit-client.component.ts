import {
  Component, Inject, OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, AbstractControl
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMaskDirective } from 'ngx-mask';
import { Subscription, debounceTime } from 'rxjs';

import { ICLientService } from '../../services/api-client/clients/iclients.service';
import { ISnackbarManagerService } from '../../services/isnackbar-manager.service';
import { SERVICES_TOKEN } from '../../services/service.token';

interface OriginalData {
  id:    number;
  name:  string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-edit-client',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTooltipModule,
    NgxMaskDirective,
  ],
  templateUrl: './edit-client.component.html',
  styleUrl:    './edit-client.component.scss',
})
export class EditClientComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  clientId!: number;

  // UI States
  isFetching    = true;
  isLoading     = false;
  submitSuccess = false;
  apiError      = '';
  hasChanges    = false;
  warnNoChanges = false;

  // Original snapshot for diff
  original: OriginalData | null = null;

  // Per-field changed flags
  changed: Record<string, boolean> = { name: false, email: false, phone: false };

  private subs = new Subscription();

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    @Inject(SERVICES_TOKEN.HTTP.CLIENT) private readonly clientService: ICLientService,
    @Inject(SERVICES_TOKEN.SNACKBAR)    private readonly snackbar: ISnackbarManagerService,
  ) {}

  ngOnInit(): void {
    this.clientId = Number(this.route.snapshot.paramMap.get('id'));
    this.buildForm();
    this.loadClient();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ── Form ────────────────────────────────────────────────────────────────────

  private buildForm(): void {
    this.form = this.fb.group({
      name:  ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      phone: ['', [Validators.required, Validators.minLength(11)]],
    });
  }

  private watchChanges(): void {
    this.subs.add(
      this.form.valueChanges.pipe(debounceTime(120)).subscribe(val => {
        if (!this.original) return;

        const rawPhone = (val.phone ?? '').replace(/\D/g, '');
        this.changed = {
          name:  val.name  !== this.original.name,
          email: val.email !== this.original.email,
          phone: rawPhone  !== this.original.phone,
        };

        this.hasChanges    = Object.values(this.changed).some(Boolean);
        this.warnNoChanges = false;
      })
    );
  }

  // ── Data Loading ────────────────────────────────────────────────────────────

  private loadClient(): void {
    this.clientService.findById(this.clientId).subscribe({
      next: (client) => {
        this.original = {
          id:    this.clientId,
          name:  client.name,
          email: client.email,
          phone: client.phone,
        };

        // Patch raw phone (no mask) — ngx-mask will format it
        this.form.patchValue({
          name:  client.name,
          email: client.email,
          phone: client.phone,
        });

        this.isFetching = false;
        this.watchChanges();
      },
      error: () => {
        this.snackbar.showError('Erro ao carregar os dados do cliente.');
        this.router.navigate(['clients/list']);
      },
    });
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  onSubmit(): void {
    this.apiError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.hasChanges) {
      this.warnNoChanges = true;
      setTimeout(() => this.warnNoChanges = false, 3000);
      return;
    }

    this.isLoading = true;

    const payload = {
      ...this.form.value,
      phone: this.form.value.phone.replace(/\D/g, ''),
    };

    this.clientService.update(this.clientId, payload).subscribe({
      next: () => {
        this.isLoading     = false;
        this.submitSuccess = true;
        this.snackbar.showSuccess('Cliente atualizado com sucesso!');
        setTimeout(() => this.router.navigate(['clients/list']), 1200);
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.message ?? 'Erro ao atualizar cliente. Tente novamente.';
        this.apiError = msg;
        this.snackbar.showError(msg);
      },
    });
  }

  onDiscard(): void {
    if (!this.original) return;
    this.form.patchValue({
      name:  this.original.name,
      email: this.original.email,
      phone: this.original.phone,
    });
    this.changed      = { name: false, email: false, phone: false };
    this.hasChanges   = false;
    this.warnNoChanges = false;
    this.apiError     = '';
  }

  onCancel(): void {
    this.router.navigate(['clients/list']);
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  get nameCtrl():  AbstractControl { return this.form.get('name')!;  }
  get emailCtrl(): AbstractControl { return this.form.get('email')!; }
  get phoneCtrl(): AbstractControl { return this.form.get('phone')!; }

  hasError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.hasError(error) && ctrl?.touched);
  }

  isFieldValid(field: string): boolean {
    return !!(this.form.get(field)?.valid && this.form.get(field)?.touched);
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  get changesCount(): number {
    return Object.values(this.changed).filter(Boolean).length;
  }

  formatPhone(phone: string): string {
    const d = (phone ?? '').replace(/\D/g, '');
    if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
    return phone;
  }
}
