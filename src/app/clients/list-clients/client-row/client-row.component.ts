import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClientRow } from '../list-clients.models';

@Component({
  selector: 'app-client-row',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatTooltipModule],
  templateUrl: './client-row.component.html',
  styleUrl:    './client-row.component.scss',
})
export class ClientRowComponent {
  @Input({ required: true }) client!: ClientRow;
  @Input()  isDeleting = false;

  @Output() edit   = new EventEmitter<number>();
  @Output() remove = new EventEmitter<number>();

  onEdit():   void { this.edit.emit(this.client.id); }
  onRemove(): void { this.remove.emit(this.client.id); }
}
