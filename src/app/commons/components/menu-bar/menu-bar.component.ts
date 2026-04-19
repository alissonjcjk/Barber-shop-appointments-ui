import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface NavItem {
  label: string;
  icon: string;
  path: string;
  children?: { label: string; icon: string; path: string }[];
}

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './menu-bar.component.html',
  styleUrl: './menu-bar.component.scss'
})
export class MenuBarComponent implements OnInit, OnDestroy {

  openMenu: string | null = null;

  navItems: NavItem[] = [
    {
      label: 'Clientes',
      icon: 'group',
      path: 'clients',
      children: [
        { label: 'Cadastrar Cliente', icon: 'person_add', path: 'clients/new-client' },
        { label: 'Listar Clientes',   icon: 'people',     path: 'clients/list' },
      ]
    },
    {
      label: 'Agendamentos',
      icon: 'calendar_month',
      path: 'schedules',
      children: [
        { label: 'Calendário Mensal', icon: 'event_note', path: 'schedules/month' },
      ]
    }
  ];

  constructor(private readonly router: Router) { }

  ngOnInit(): void {
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

  toggleMenu(label: string, event: Event): void {
    event.stopPropagation();
    this.openMenu = this.openMenu === label ? null : label;
  }

  navigateTo(path: string): void {
    this.openMenu = null;
    this.router.navigate([path]);
  }

  private onDocumentClick(): void {
    this.openMenu = null;
  }
}
