import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxMaskDirective } from 'ngx-mask';
import { ICLientService } from '../../services/api-client/clients/iclients.service';
import { ISnackbarManagerService } from '../../services/isnackbar-manager.service';
import { SERVICES_TOKEN } from '../../services/service.token';

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
    NgxMaskDirective
  ],
  templateUrl: './new-client.component.html',
  styleUrl: './new-client.component.scss'
})
export class NewClientComponent {

  form: FormGroup;
  isLoading = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    @Inject(SERVICES_TOKEN.HTTP.CLIENT) private readonly clientService: ICLientService,
    @Inject(SERVICES_TOKEN.SNACKBAR) private readonly snackbar: ISnackbarManagerService
  ) {
    this.form = this.fb.group({
      name:  ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.clientService.save(this.form.value).subscribe({
      next: () => {
        this.snackbar.showSuccess('Cliente cadastrado com sucesso!');
        this.router.navigate(['clients/list']);
      },
      error: () => {
        this.snackbar.showError('Erro ao cadastrar cliente. Tente novamente.');
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['clients/list']);
  }

  hasError(field: string, error: string): boolean {
    const control = this.form.get(field);
    return !!(control?.hasError(error) && control?.touched);
  }
}
