import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl
} from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { NgxMaskDirective } from 'ngx-mask';
import { Subscription, debounceTime } from 'rxjs';

import { ICLientService } from '../../services/api-client/clients/iclients.service';
import { ISnackbarManagerService } from '../../services/isnackbar-manager.service';
import { SERVICES_TOKEN } from '../../services/service.token';

interface FieldState {
  touched: boolean;
  valid: boolean;
  value: string;
}

@Component({
  selector: 'app-new-client',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatIconModule,
    NgxMaskDirective,
  ],
  templateUrl: './new-client.component.html',
  styleUrl:    './new-client.component.scss',
})
export class NewClientComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  isLoading      = false;
  submitSuccess  = false;
  apiError       = '';
  formProgress   = 0;

  // Tracks which fields have been interacted with for visual cues
  fieldStates: Record<string, FieldState> = {
    name:  { touched: false, valid: false, value: '' },
    email: { touched: false, valid: false, value: '' },
    phone: { touched: false, valid: false, value: '' },
  };

  private subs = new Subscription();

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    @Inject(SERVICES_TOKEN.HTTP.CLIENT) private readonly clientService: ICLientService,
    @Inject(SERVICES_TOKEN.SNACKBAR)    private readonly snackbar: ISnackbarManagerService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.watchProgress();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ── Form Setup ──────────────────────────────────────────────────────────────

  private buildForm(): void {
    this.form = this.fb.group({
      name:  ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(150),
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(150),
      ]],
      phone: ['', [
        Validators.required,
        Validators.minLength(11),
      ]],
    });

    // Update field states on value changes for live feedback
    Object.keys(this.fieldStates).forEach(key => {
      this.subs.add(
        this.form.get(key)!.valueChanges.pipe(debounceTime(150)).subscribe(value => {
          const control = this.form.get(key)!;
          this.fieldStates[key] = {
            touched: control.touched || !!value,
            valid:   control.valid,
            value,
          };
        })
      );
    });
  }

  private watchProgress(): void {
    this.subs.add(
      this.form.valueChanges.pipe(debounceTime(100)).subscribe(() => {
        const total   = Object.keys(this.fieldStates).length;
        const filled  = Object.keys(this.fieldStates).filter(
          k => this.form.get(k)!.valid
        ).length;
        this.formProgress = Math.round((filled / total) * 100);
      })
    );
  }

  // ── Actions ─────────────────────────────────────────────────────────────────

  onSubmit(): void {
    this.apiError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      Object.keys(this.fieldStates).forEach(k => {
        this.fieldStates[k] = {
          ...this.fieldStates[k],
          touched: true,
          valid: this.form.get(k)!.valid,
        };
      });
      return;
    }

    this.isLoading = true;

    const payload = {
      ...this.form.value,
      phone: this.form.value.phone.replace(/\D/g, ''), // strip mask
    };

    this.clientService.save(payload).subscribe({
      next: () => {
        this.isLoading     = false;
        this.submitSuccess = true;
        this.snackbar.showSuccess('Cliente cadastrado com sucesso!');

        setTimeout(() => {
          this.router.navigate(['clients/list']);
        }, 1200);
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.message ?? 'Erro ao cadastrar cliente. Tente novamente.';
        this.apiError = msg;
        this.snackbar.showError(msg);
      },
    });
  }

  onReset(): void {
    this.form.reset();
    this.apiError     = '';
    this.formProgress = 0;
    Object.keys(this.fieldStates).forEach(k => {
      this.fieldStates[k] = { touched: false, valid: false, value: '' };
    });
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
    return !!(this.form.get(field)?.valid && this.fieldStates[field]?.touched);
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  progressColor(): string {
    if (this.formProgress < 40) return 'var(--clr-danger)';
    if (this.formProgress < 80) return 'var(--clr-warning)';
    return 'var(--clr-success)';
  }
}
