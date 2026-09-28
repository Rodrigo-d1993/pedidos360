import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="topbar">
      <a class="brand" routerLink="/productos">Pedidos<span>360</span></a>

      <nav *ngIf="autenticado">
        <a routerLink="/productos" routerLinkActive="active">Productos</a>
        <a routerLink="/pedidos" routerLinkActive="active">Mis pedidos</a>
      </nav>

      <div class="user" *ngIf="autenticado">
        <span>{{ usuario }}</span>
        <button class="btn btn-outline" (click)="logout()">Cerrar sesión</button>
      </div>
    </header>

    <main class="container">
      <router-outlet></router-outlet>
    </main>
  `,
})
export class AppComponent implements OnInit {
  autenticado = false;
  usuario = '';

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.actualizarSesion();
    // Cada vez que se navega, se vuelve a revisar si hay sesión
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.actualizarSesion());
  }

  private async actualizarSesion(): Promise<void> {
    this.autenticado = await this.auth.isAuthenticated();
    this.usuario = this.autenticado ? await this.auth.getUserLabel() : '';
  }

  async logout(): Promise<void> {
    await this.auth.logout();
  }
}