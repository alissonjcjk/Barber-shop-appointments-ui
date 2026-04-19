import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, Subscription } from 'rxjs';

interface NavChild {
  label: string;
  icon: string;
  path: string;
  badge?: string;
}

interface NavItem {
  label: string;
  icon: string;
  path: string;
  children?: NavChild[];
}

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './menu-bar.component.html',
  styleUrl:    './menu-bar.component.scss'
})
export class MenuBarComponent implements OnInit, OnDestroy {

  openMenu:       string | null = null;
  mobileOpen      = false;
  scrolled        = false;
  activeRootPath  = '';

  navItems: NavItem[] = [
    {
      label: 'Clientes',
      icon:  'group',
      path:  'clients',
      children: [
        { label: 'Cadastrar Cliente', icon: 'person_add',    path: 'clients/new-client' },
        { label: 'Listar Clientes',   icon: 'manage_accounts', path: 'clients/list' },
      ]
    },
    {
      label: 'Agendamentos',
      icon:  'calendar_month',
      path:  'schedules',
      children: [
        { label: 'Calendário Mensal', icon: 'event_note', path: 'schedules/month' },
      ]
    }
  ];

  private subs = new Subscription();

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    // Track active root section for underline indicator
    this.subs.add(
      this.router.events
        .pipe(filter(e => e instanceof NavigationEnd))
        .subscribe((e: any) => {
          this.activeRootPath = e.urlAfterRedirects?.split('/')[1] ?? '';
          this.mobileOpen = false;
          this.openMenu   = null;
        })
    );
    // Set initial active state
    this.activeRootPath = this.router.url.split('/')[1] ?? '';
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    document.removeEventListener('click', this.onDocumentClick);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 8;
  }

  toggleMenu(label: string, event: Event): void {
    event.stopPropagation();
    this.openMenu = this.openMenu === label ? null : label;

    if (this.openMenu) {
      // Close on outside click
      setTimeout(() => document.addEventListener('click', this.onDocumentClick), 0);
    }
  }

  navigateTo(path: string): void {
    this.openMenu   = null;
    this.mobileOpen = false;
    this.router.navigate([path]);
  }

  toggleMobile(event: Event): void {
    event.stopPropagation();
    this.mobileOpen = !this.mobileOpen;
    this.openMenu   = null;
  }

  isActive(path: string): boolean {
    return this.activeRootPath === path;
  }

  private onDocumentClick = (): void => {
    this.openMenu = null;
    document.removeEventListener('click', this.onDocumentClick);
  };
}
