import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxMaskDirective } from 'ngx-mask';
import { ICLientService } from '../../services/api-client/clients/iclients.service';
import { ISnackbarManagerService } from '../../services/isnackbar-manager.service';
import { SERVICES_TOKEN } from '../../services/service.token';

@Component({
  selector: 'app-edit-client',
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
  templateUrl: './edit-client.component.html',
  styleUrl: './edit-client.component.scss'
})
export class EditClientComponent implements OnInit {

  form: FormGroup;
  isLoading = false;
  isFetching = true;
  clientId!: number;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
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

  ngOnInit(): void {
    this.clientId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadClient();
  }

  private loadClient(): void {
    this.clientService.findById(this.clientId).subscribe({
      next: (client) => {
        this.form.patchValue(client);
        this.isFetching = false;
      },
      error: () => {
        this.snackbar.showError('Erro ao carregar os dados do cliente.');
        this.router.navigate(['clients/list']);
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    this.clientService.update(this.clientId, this.form.value).subscribe({
      next: () => {
        this.snackbar.showSuccess('Cliente atualizado com sucesso!');
        this.router.navigate(['clients/list']);
      },
      error: () => {
        this.snackbar.showError('Erro ao atualizar cliente. Tente novamente.');
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
