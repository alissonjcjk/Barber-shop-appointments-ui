import { Observable } from 'rxjs';

export interface ISnackbarManagerService {
  show(message: string, action?: string, duration?: number): void;
  showSuccess(message: string): void;
  showError(message: string): void;
}
