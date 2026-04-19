import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface RouteConfig {
  icon: string;
  breadcrumbs: BreadcrumbItem[];
  badge?: string;
  badgeColor?: string;
}

const ROUTE_MAP: Record<string, RouteConfig> = {
  'clients/new-client':      { icon: 'person_add',       breadcrumbs: [{ label: 'Clientes', path: 'clients/list' }, { label: 'Novo Cliente' }] },
  'clients/list':            { icon: 'manage_accounts',   breadcrumbs: [{ label: 'Clientes', path: 'clients/list' }] },
  'clients/edit-client':     { icon: 'edit',              breadcrumbs: [{ label: 'Clientes', path: 'clients/list' }, { label: 'Editar Cliente' }] },
  'schedules/month':         { icon: 'calendar_month',    breadcrumbs: [{ label: 'Agendamentos' }, { label: 'Calendário Mensal' }], badge: 'Mês atual', badgeColor: 'primary' },
};

@Component({
  selector: 'app-card-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './card-header.component.html',
  styleUrl:    './card-header.component.scss'
})
export class CardHeaderComponent implements OnInit, OnDestroy {
  @Input() subtitle?: string;

  icon         = 'content_cut';
  breadcrumbs: BreadcrumbItem[] = [];
  badge?: string;
  badgeColor   = 'primary';
  pageTitle    = 'BarberDev';

  private subs = new Subscription();

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.updateFromUrl(this.router.url);

    this.subs.add(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd))
        .subscribe((e: any) => this.updateFromUrl(e.urlAfterRedirects))
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private updateFromUrl(url: string): void {
    // Strip leading slash and query params
    const clean = url.replace(/^\//, '').split('?')[0].split('#')[0];

    // Match route, stripping dynamic :id segments
    const key = Object.keys(ROUTE_MAP).find(k => clean.startsWith(k.replace(':id', '')));
    const config = key ? ROUTE_MAP[key] : null;

    if (config) {
      this.icon        = config.icon;
      this.breadcrumbs = config.breadcrumbs;
      this.badge       = config.badge;
      this.badgeColor  = config.badgeColor ?? 'primary';
    } else {
      this.icon        = 'content_cut';
      this.breadcrumbs = [];
      this.badge       = undefined;
    }
  }

  navigate(path?: string): void {
    if (path) this.router.navigate([path]);
  }
}
