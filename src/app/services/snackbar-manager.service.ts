import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ISnackbarManagerService } from './isnackbar-manager.service';

@Injectable({
  providedIn: 'root'
})
export class SnackbarManagerService implements ISnackbarManagerService {

  constructor(private readonly snackBar: MatSnackBar) { }

  show(message: string, action: string = 'Fechar', duration: number = 3500): void {
    this.snackBar.open(message, action, {
      duration,
      verticalPosition: 'top',
      horizontalPosition: 'right'
    });
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, '✕', {
      duration: 3500,
      verticalPosition: 'top',
      horizontalPosition: 'right',
      panelClass: ['success-snack']
    });
  }

  showError(message: string): void {
    this.snackBar.open(message, '✕', {
      duration: 5000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
      panelClass: ['error-snack']
    });
  }
}
