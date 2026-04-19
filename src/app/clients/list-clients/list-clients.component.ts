import { Component } from '@angular/core';

@Component({
  selector: 'app-list-clients',
  standalone: true,
  imports: [],
  template: `
    <div class="card-dev">
      <div style="padding: 2rem; text-align: center; color: var(--clr-text-muted);">
        A lista de clientes será construída no próximo passo.
      </div>
    </div>
  `,
  styles: ``
})
export class ListClientsComponent {}
